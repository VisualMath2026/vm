import type { SessionState } from "../dto/types";

export type WsEvent =
  | { type: "HELLO"; payload: { ts: string } }
  | { type: "SESSION_JOINED"; payload: { sessionId: string; state: SessionState } }
  | { type: "BLOCK_CHANGED"; payload: { activeBlockId: string; stateVersion: number } }
  | { type: "PARTICIPANT_STATUS"; payload: { userId: string; status: string; ts: string } }
  | { type: "QUIZ_RESULT"; payload: { attemptId: string; score: number; maxScore: number } }
  | { type: "GRAPHICS_STATE"; payload: { snapshot: unknown; stateVersion: number } }
  | { type: "ERROR"; payload: { code: string; message: string; retryable?: boolean } };

export type WsCommand =
  | { type: "JOIN_SESSION"; payload: { sessionId: string } }
  | { type: "LEAVE_SESSION"; payload: { sessionId: string } }
  | { type: "SET_ACTIVE_BLOCK"; payload: { sessionId: string; blockId: string } }
  | { type: "PUSH_GRAPHICS_SNAPSHOT"; payload: { sessionId: string; snapshot: unknown } };
