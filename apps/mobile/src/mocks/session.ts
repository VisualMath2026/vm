import type { LectureDetails } from "@vm/shared";
import type { LectureItem } from "./lectures";

export type QuestionType = "single-choice" | "multiple-choice" | "short-answer";

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
  correctOptionIds?: string[];
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
  questions: Question[];
};

export type TaskAnswer = {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  shortAnswer?: string;
};

export type TaskSubmission = {
  answers: TaskAnswer[];
  timeSpentSec: number;
  status: "submitted" | "timeout";
};

export type TaskResultAnswer = {
  questionId: string;
  prompt: string;
  submittedAnswerLabel: string;
  correctAnswerLabel: string;
  explanation: string;
  isCorrect: boolean;
};

export type TaskResult = {
  correctCount: number;
  totalQuestions: number;
  earnedPoints: number;
  maxPoints: number;
  answers: TaskResultAnswer[];
  status: "submitted" | "timeout";
  timeSpentSec: number;
};

function lectureQuestions(lectureId: string): Question[] {
  if (lectureId === "lecture-2") {
    return [
      {
        id: "d-1",
        type: "single-choice",
        prompt: "Что геометрически показывает производная функции в точке?",
        options: [
          { id: "a", label: "Площадь под графиком" },
          { id: "b", label: "Угол наклона касательной" },
          { id: "c", label: "Количество корней" },
          { id: "d", label: "Значение интеграла" }
        ],
        correctOptionId: "b",
        explanation: "Производная в точке связана с угловым коэффициентом касательной.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "d-2",
        type: "short-answer",
        prompt: "Найдите производную x² в точке x = 3. Введите только число.",
        correctAnswerText: "6",
        explanation: "Для x² производная равна 2x, поэтому при x = 3 получаем 6.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "d-3",
        type: "multiple-choice",
        prompt: "Какие утверждения о производной верны? Выберите все правильные варианты.",
        options: [
          { id: "a", label: "Если производная положительна на промежутке, функция возрастает." },
          { id: "b", label: "Производная константы равна 1." },
          { id: "c", label: "Производная x² равна 2x." },
          { id: "d", label: "Касательная всегда параллельна оси Ox." }
        ],
        correctOptionIds: ["a", "c"],
        explanation: "Верны утверждения про возрастание функции при положительной производной и формулу (x²)' = 2x.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "d-4",
        type: "single-choice",
        prompt: "Чему равна производная константы?",
        options: [
          { id: "a", label: "0" },
          { id: "b", label: "1" },
          { id: "c", label: "x" },
          { id: "d", label: "Не существует" }
        ],
        correctOptionId: "a",
        explanation: "Постоянная не изменяется, поэтому её производная равна 0.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "d-5",
        type: "short-answer",
        prompt: "Чему равна производная функции 5x + 2? Введите только число.",
        correctAnswerText: "5",
        explanation: "Производная линейной функции ax + b равна a.",
        timeLimitSec: 240,
        points: 1
      }
    ];
  }

  if (lectureId === "lecture-3") {
    return [
      {
        id: "v-1",
        type: "short-answer",
        prompt: "Чему равна длина вектора (3, 4)? Введите только число.",
        correctAnswerText: "5",
        explanation: "Длина вектора (3, 4) равна √(3² + 4²) = 5.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "v-2",
        type: "single-choice",
        prompt: "Чему равна сумма векторов (1, 2) и (3, 4)?",
        options: [
          { id: "a", label: "(4, 6)" },
          { id: "b", label: "(3, 8)" },
          { id: "c", label: "(2, 2)" },
          { id: "d", label: "(1, 8)" }
        ],
        correctOptionId: "a",
        explanation: "Складывай координаты векторов по компонентам.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "v-3",
        type: "single-choice",
        prompt: "Какие векторы называются коллинеарными?",
        options: [
          { id: "a", label: "Одинаковой длины" },
          { id: "b", label: "Лежащие на одной или параллельных прямых" },
          { id: "c", label: "Только положительные" },
          { id: "d", label: "Только единичные" }
        ],
        correctOptionId: "b",
        explanation: "Коллинеарные векторы лежат на одной прямой или на параллельных прямых.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "v-4",
        type: "short-answer",
        prompt: "Найдите скалярное произведение (1, 2) и (2, 3). Введите только число.",
        correctAnswerText: "8",
        explanation: "1·2 + 2·3 = 8.",
        timeLimitSec: 240,
        points: 1
      },
      {
        id: "v-5",
        type: "single-choice",
        prompt: "Чему равен вектор (5, 1) - (2, 3)?",
        options: [
          { id: "a", label: "(7, 4)" },
          { id: "b", label: "(3, -2)" },
          { id: "c", label: "(-3, 2)" },
          { id: "d", label: "(3, 2)" }
        ],
        correctOptionId: "b",
        explanation: "Вычитание выполняется по координатам: (5 - 2, 1 - 3) = (3, -2).",
        timeLimitSec: 240,
        points: 1
      }
    ];
  }

  return [
    {
      id: "f-1",
      type: "single-choice",
      prompt: "Что лучше всего описывает функцию?",
      options: [
        { id: "a", label: "Одному x соответствуют несколько y" },
        { id: "b", label: "Каждому x соответствует ровно одно y" },
        { id: "c", label: "Функция задаётся только формулой" },
        { id: "d", label: "Функция всегда линейна" }
      ],
      correctOptionId: "b",
      explanation: "Функция сопоставляет каждому допустимому x единственное значение y.",
      timeLimitSec: 240,
      points: 1
    },
    {
      id: "f-2",
      type: "single-choice",
      prompt: "Если график пересекает ось Ox в точке x = 3, то это значит, что...",
      options: [
        { id: "a", label: "f(3) = 0" },
        { id: "b", label: "f(0) = 3" },
        { id: "c", label: "f(3) = 1" },
        { id: "d", label: "функция не определена" }
      ],
      correctOptionId: "a",
      explanation: "Точка пересечения с осью Ox соответствует нулю функции.",
      timeLimitSec: 240,
      points: 1
    },
    {
      id: "f-3",
      type: "short-answer",
      prompt: "Чему равно значение y = 2x + 1 при x = 4? Введите только число.",
      correctAnswerText: "9",
      explanation: "2·4 + 1 = 9.",
      timeLimitSec: 240,
      points: 1
    },
    {
      id: "f-4",
      type: "single-choice",
      prompt: "Как изменится график y = x² при переходе к y = x² + 3?",
      options: [
        { id: "a", label: "Сместится вверх на 3" },
        { id: "b", label: "Сместится вниз на 3" },
        { id: "c", label: "Сместится вправо на 3" },
        { id: "d", label: "Станет уже" }
      ],
      correctOptionId: "a",
      explanation: "Прибавление числа к функции сдвигает график вверх.",
      timeLimitSec: 240,
      points: 1
    },
    {
      id: "f-5",
      type: "short-answer",
      prompt: "Сколько нулей у функции y = x² - 1? Введите только число.",
      correctAnswerText: "2",
      explanation: "Уравнение x² - 1 = 0 имеет два корня: -1 и 1.",
      timeLimitSec: 240,
      points: 1
    }
  ];
}

function buildQuestionsFromLectureDetails(
  lecture: LectureItem,
  lectureDetails?: LectureDetails | null
): Question[] {
  const quizBlock = lectureDetails?.blocks.find((block) => block.type === "quiz");

  if (!quizBlock || quizBlock.type !== "quiz" || quizBlock.payload.questions.length === 0) {
    return lecture.id.startsWith("draft-") ? [] : lectureQuestions(lecture.id);
  }

  return quizBlock.payload.questions.map((question: any, index: number) => {
    const baseQuestion = {
      id: String(question?.id ?? `draft-question-${index + 1}`),
      prompt: String(question?.text ?? `Вопрос ${index + 1}`),
      explanation: String(question?.correctAnswerHint ?? "Добавлено преподавателем."),
      timeLimitSec: Number(quizBlock.payload.timeLimitSec ?? 180),
      points: 1
    };

    if (question?.type === "single") {
      return {
        ...baseQuestion,
        type: "single-choice" as const,
        options: Array.isArray(question?.options)
          ? question.options.map((option: any, optionIndex: number) => ({
              id: String(option?.id ?? String.fromCharCode(97 + optionIndex)),
              label: String(option?.text ?? option?.label ?? `Вариант ${optionIndex + 1}`)
            }))
          : [],
        correctOptionId: String(question?.correctOptionId ?? "a")
      };
    }

    if (question?.type === "multi") {
      return {
        ...baseQuestion,
        type: "multiple-choice" as const,
        options: Array.isArray(question?.options)
          ? question.options.map((option: any, optionIndex: number) => ({
              id: String(option?.id ?? String.fromCharCode(97 + optionIndex)),
              label: String(option?.text ?? option?.label ?? `Вариант ${optionIndex + 1}`)
            }))
          : [],
        correctOptionIds: Array.isArray(question?.correctOptionIds)
          ? question.correctOptionIds.map(String)
          : []
      };
    }

    return {
      ...baseQuestion,
      type: "short-answer" as const,
      correctAnswerText: String(question?.correctAnswerText ?? "")
    };
  });
}

export function createMockSession(
  lecture: LectureItem,
  lectureDetails?: LectureDetails | null
): SessionData {
  return {
    sessionId: `session-${lecture.id}`,
    sessionCode: lecture.id.toUpperCase().replace("LECTURE-", "VM-"),
    lectureId: lecture.id,
    lectureTitle: lecture.title,
    connectionStatus: "online",
    status: "active",
    currentBlockTitle: "Проверочный блок",
    participantsCount: lecture.id === "lecture-3" ? 18 : 24,
    startedAt: new Date().toISOString(),
    questions: buildQuestionsFromLectureDetails(lecture, lectureDetails)
  };
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeOptionIds(value: string[] | undefined): string[] {
  return [...(value ?? [])].sort();
}

export function evaluateSubmission(
  session: SessionData,
  submission: TaskSubmission
): TaskResult {
  const answers = session.questions.map((question) => {
    const submitted = submission.answers.find((item) => item.questionId === question.id);

    if (question.type === "single-choice") {
      const selectedOption = question.options?.find((option) => option.id === submitted?.selectedOptionId);
      const correctOption = question.options?.find((option) => option.id === question.correctOptionId);
      const isCorrect = submitted?.selectedOptionId === question.correctOptionId;

      return {
        questionId: question.id,
        prompt: question.prompt,
        submittedAnswerLabel: selectedOption?.label ?? "Ответ не указан",
        correctAnswerLabel: correctOption?.label ?? "Нет данных",
        explanation: question.explanation,
        isCorrect
      };
    }

    if (question.type === "multiple-choice") {
      const submittedIds = normalizeOptionIds(submitted?.selectedOptionIds);
      const correctIds = normalizeOptionIds(question.correctOptionIds);

      const submittedLabels =
        question.options
          ?.filter((option) => submittedIds.includes(option.id))
          .map((option) => option.label) ?? [];

      const correctLabels =
        question.options
          ?.filter((option) => correctIds.includes(option.id))
          .map((option) => option.label) ?? [];

      const isCorrect =
        submittedIds.length === correctIds.length &&
        submittedIds.every((id, index) => id === correctIds[index]);

      return {
        questionId: question.id,
        prompt: question.prompt,
        submittedAnswerLabel: submittedLabels.length > 0 ? submittedLabels.join(", ") : "Ответ не указан",
        correctAnswerLabel: correctLabels.length > 0 ? correctLabels.join(", ") : "Нет данных",
        explanation: question.explanation,
        isCorrect
      };
    }

    const isCorrect = normalize(submitted?.shortAnswer) === normalize(question.correctAnswerText);

    return {
      questionId: question.id,
      prompt: question.prompt,
      submittedAnswerLabel: submitted?.shortAnswer?.trim() || "Ответ не указан",
      correctAnswerLabel: question.correctAnswerText ?? "Нет данных",
      explanation: question.explanation,
      isCorrect
    };
  });

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const earnedPoints = session.questions.reduce((sum, question, index) => {
    return sum + (answers[index]?.isCorrect ? question.points : 0);
  }, 0);
  const maxPoints = session.questions.reduce((sum, question) => sum + question.points, 0);

  return {
    correctCount,
    totalQuestions: session.questions.length,
    earnedPoints,
    maxPoints,
    answers,
    status: submission.status,
    timeSpentSec: submission.timeSpentSec
  };
}

