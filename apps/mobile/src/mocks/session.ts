import type { LectureItem } from "./lectures";

export type QuestionType = "single-choice" | "short-answer";

export type QuestionOption = {
  id: string;
  label: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  correctAnswerText?: string;
  explanation: string;
  timeLimitSec: number;
  points: number;
};

export type SessionData = {
  sessionId: string;
  sessionCode: string;
  lectureId: string;
  lectureTitle: string;
  connectionStatus: "online" | "offline";
  status: "active" | "waiting" | "finished";
  currentBlockTitle: string;
  participantsCount: number;
  startedAt: string;
  question: Question;
};

export type TaskSubmission = {
  selectedOptionId?: string;
  shortAnswer?: string;
  timeSpentSec: number;
  status: "submitted" | "timeout";
};

export type TaskResult = {
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  submittedAnswerLabel: string;
  correctAnswerLabel: string;
  explanation: string;
  status: "submitted" | "timeout";
  timeSpentSec: number;
};

export function createMockSession(lecture: LectureItem): SessionData {
  if (lecture.id === "lecture-3") {
    return {
      sessionId: "session-vectors",
      sessionCode: "VEC-248",
      lectureId: lecture.id,
      lectureTitle: lecture.title,
      connectionStatus: "online",
      status: "active",
      currentBlockTitle: "Краткое задание",
      participantsCount: 18,
      startedAt: new Date().toISOString(),
      question: {
        id: "q-short-1",
        type: "short-answer",
        prompt: "Чему равна длина вектора (3, 4)? Введите только число.",
        correctAnswerText: "5",
        explanation: "Длина вектора (3, 4) равна √(3² + 4²) = 5.",
        timeLimitSec: 45,
        points: 1
      }
    };
  }

  return {
    sessionId: "session-default",
    sessionCode: "MATH-101",
    lectureId: lecture.id,
    lectureTitle: lecture.title,
    connectionStatus: "online",
    status: "active",
    currentBlockTitle: "Проверочный блок",
    participantsCount: 24,
    startedAt: new Date().toISOString(),
    question: {
      id: "q-choice-1",
      type: "single-choice",
      prompt: "Что геометрически показывает производная функции в точке?",
      options: [
        { id: "a", label: "Площадь под графиком" },
        { id: "b", label: "Угол наклона касательной" },
        { id: "c", label: "Количество корней уравнения" },
        { id: "d", label: "Значение интеграла" }
      ],
      correctOptionId: "b",
      explanation: "Производная в точке интерпретируется как угловой коэффициент касательной к графику функции.",
      timeLimitSec: 60,
      points: 1
    }
  };
}

export function evaluateSubmission(
  session: SessionData,
  submission: TaskSubmission
): TaskResult {
  const question = session.question;

  if (question.type === "single-choice") {
    const selectedOption = question.options?.find(
      (option) => option.id === submission.selectedOptionId
    );

    const correctOption = question.options?.find(
      (option) => option.id === question.correctOptionId
    );

    const isCorrect = submission.selectedOptionId === question.correctOptionId;

    return {
      isCorrect,
      earnedPoints: isCorrect ? question.points : 0,
      maxPoints: question.points,
      submittedAnswerLabel: selectedOption?.label ?? "Ответ не выбран",
      correctAnswerLabel: correctOption?.label ?? "Нет данных",
      explanation: question.explanation,
      status: submission.status,
      timeSpentSec: submission.timeSpentSec
    };
  }

  const normalizedSubmitted = (submission.shortAnswer ?? "").trim().toLowerCase();
  const normalizedCorrect = (question.correctAnswerText ?? "").trim().toLowerCase();
  const isCorrect = normalizedSubmitted.length > 0 && normalizedSubmitted === normalizedCorrect;

  return {
    isCorrect,
    earnedPoints: isCorrect ? question.points : 0,
    maxPoints: question.points,
    submittedAnswerLabel: submission.shortAnswer?.trim() || "Ответ не введён",
    correctAnswerLabel: question.correctAnswerText ?? "Нет данных",
    explanation: question.explanation,
    status: submission.status,
    timeSpentSec: submission.timeSpentSec
  };
}