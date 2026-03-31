export type Role = "student" | "teacher" | "admin";
export type BlockType = "text" | "quiz" | "visual";

export interface UserProfile {
  id: string;
  login: string;
  fullName: string;
  role: Role;
  group?: string;
}

export interface LectureSummary {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
}

export interface LectureBlockBase {
  id: string;
  type: BlockType;
  title?: string;
}

export interface TextBlock extends LectureBlockBase {
  type: "text";
  payload: { markdown: string };
}

export type QuizQuestionType = "single" | "multi" | "short";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  options?: QuizOption[];
  correctAnswerHint?: string;
}

export interface QuizBlock extends LectureBlockBase {
  type: "quiz";
  payload: { questions: QuizQuestion[]; timeLimitSec?: number };
}

export interface VisualBlock extends LectureBlockBase {
  type: "visual";
  payload: { scene: unknown; caption?: string };
}

export type LectureBlock = TextBlock | QuizBlock | VisualBlock;

export interface LectureDetails {
  id: string;
  title: string;
  description?: string;
  blocks: LectureBlock[];
}

export interface ParticipantStatus {
  userId: string;
  fullName: string;
  role: Role;
  status: "connected" | "disconnected" | "idle" | "working" | "submitted";
  lastSeenAt?: string;
}

export interface SessionState {
  sessionId: string;
  lectureId: string;
  activeBlockId: string;
  participants: ParticipantStatus[];
  updatedAt: string;
}
