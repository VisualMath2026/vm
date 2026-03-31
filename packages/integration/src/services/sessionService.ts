import type { SessionState, WsEvent } from "@vm/shared";
import { HttpClient } from "../http/httpClient";
import { WsClient } from "../ws/wsClient";

export class SessionService {
  private currentState: SessionState | null = null;
  private stateVersion = 0;

  constructor(
    private readonly http: HttpClient,
    private readonly ws: WsClient
  ) {}

  async createSession(lectureId: string): Promise<{ sessionId: string }> {
    return this.http.postJson("/sessions", { lectureId });
  }

  async getSession(sessionId: string): Promise<SessionState> {
    const state = await this.http.getJson<SessionState>(`/sessions/${sessionId}`);
    this.currentState = state;
    return state;
  }

  joinWs(sessionId: string) {
    this.ws.connect();
    this.ws.send({ type: "JOIN_SESSION", payload: { sessionId } });
  }

  handleWsEvent(event: WsEvent, onStateUpdate: (state: SessionState) => void) {
    if (event.type === "SESSION_JOINED") {
      this.currentState = event.payload.state;
      this.stateVersion = 0;
      onStateUpdate(event.payload.state);
      return;
    }

    if (event.type === "BLOCK_CHANGED" && this.currentState) {
      this.stateVersion = event.payload.stateVersion;
      this.currentState = {
        ...this.currentState,
        activeBlockId: event.payload.activeBlockId,
        updatedAt: new Date().toISOString()
      };
      onStateUpdate(this.currentState);
      return;
    }

    if (event.type === "PARTICIPANT_STATUS" && this.currentState) {
      this.currentState = {
        ...this.currentState,
        participants: this.currentState.participants.map(
          (participant: SessionState["participants"][number]) =>
            participant.userId === event.payload.userId
              ? {
                  ...participant,
                  status: event.payload.status as SessionState["participants"][number]["status"]
                }
              : participant
        ),
        updatedAt: event.payload.ts
      };
      onStateUpdate(this.currentState);
    }
  }

  async setActiveBlock(sessionId: string, blockId: string): Promise<void> {
    await this.http.postJson(`/sessions/${sessionId}/activeBlock`, { blockId });
    this.ws.send({ type: "SET_ACTIVE_BLOCK", payload: { sessionId, blockId } });
  }

  getLocalState(): SessionState | null {
    return this.currentState;
  }

  getStateVersion(): number {
    return this.stateVersion;
  }
}