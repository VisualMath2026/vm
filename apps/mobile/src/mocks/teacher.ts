import type { LectureItem } from "./lectures";

export type TeacherParticipantStatus =
  | "online"
  | "in-progress"
  | "completed"
  | "offline";

export type TeacherParticipant = {
  id: string;
  name: string;
  status: TeacherParticipantStatus;
  score: number | null;
};

export type TeacherManagedSession = {
  sessionId: string;
  sessionCode: string;
  lectureId: string;
  lectureTitle: string;
  status: "draft" | "active" | "stopped";
  blocks: string[];
  currentBlockIndex: number;
  participants: TeacherParticipant[];
};

export function createTeacherManagedSession(
  lecture: LectureItem
): TeacherManagedSession {
  return {
    sessionId: `teacher-session-${lecture.id}`,
    sessionCode: `T-${lecture.id.slice(-1)}${lecture.title.length}`,
    lectureId: lecture.id,
    lectureTitle: lecture.title,
    status: "draft",
    blocks: lecture.blocks,
    currentBlockIndex: 0,
    participants: [
      { id: "s1", name: "Иван Петров", status: "online", score: null },
      { id: "s2", name: "Мария Смирнова", status: "in-progress", score: null },
      { id: "s3", name: "Олег Кузнецов", status: "completed", score: 1 },
      { id: "s4", name: "Анна Волкова", status: "offline", score: null }
    ]
  };
}

export function getTeacherCurrentBlock(
  session: TeacherManagedSession
): string {
  return session.blocks[session.currentBlockIndex] ?? "Блок не найден";
}

export function moveTeacherSessionBlock(
  session: TeacherManagedSession,
  direction: "prev" | "next"
): TeacherManagedSession {
  const nextIndex =
    direction === "next"
      ? Math.min(session.currentBlockIndex + 1, session.blocks.length - 1)
      : Math.max(session.currentBlockIndex - 1, 0);

  return {
    ...session,
    currentBlockIndex: nextIndex
  };
}

export function updateTeacherSessionStatus(
  session: TeacherManagedSession,
  status: "draft" | "active" | "stopped"
): TeacherManagedSession {
  return {
    ...session,
    status
  };
}

export function countTeacherParticipantStatuses(
  session: TeacherManagedSession
) {
  return {
    online: session.participants.filter((item) => item.status === "online").length,
    inProgress: session.participants.filter((item) => item.status === "in-progress").length,
    completed: session.participants.filter((item) => item.status === "completed").length,
    offline: session.participants.filter((item) => item.status === "offline").length
  };
}