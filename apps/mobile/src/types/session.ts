export interface LectureSession {
  id: string;
  lectureId: string;
  status: "idle" | "active" | "finished";
  currentBlockId?: string;
}

export interface SessionEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp?: string;
}
