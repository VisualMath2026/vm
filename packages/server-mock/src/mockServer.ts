import cors from "cors";
import express from "express";

type Role = "student" | "teacher" | "admin";
type BlockType = "text" | "quiz" | "visual";

interface LectureBlock {
  id: string;
  type: BlockType;
  title?: string;
  payload: unknown;
}

interface LectureDetails {
  id: string;
  title: string;
  description?: string;
  blocks: LectureBlock[];
}

interface SessionState {
  sessionId: string;
  lectureId: string;
  activeBlockId: string;
  participants: {
    userId: string;
    fullName: string;
    role: Role;
    status: "connected" | "disconnected" | "idle" | "working" | "submitted";
    lastSeenAt?: string;
  }[];
  updatedAt: string;
}

type QuizQuestion =
  | {
      id: string;
      type: "single";
      text: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
      correctAnswerHint?: string;
    }
  | {
      id: string;
      type: "short";
      text: string;
      correctAnswerText: string;
      correctAnswerHint?: string;
    };

type QuizBlockPayload = {
  questions: QuizQuestion[];
  timeLimitSec?: number;
};

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 8787);

const USERS = [
  {
    id: "u-1",
    login: "student",
    password: "student",
    role: "student" as Role,
    fullName: "Тестовый студент"
  },
  {
    id: "u-2",
    login: "teacher",
    password: "teacher",
    role: "teacher" as Role,
    fullName: "Тестовый преподаватель"
  }
];

const LECTURES: LectureDetails[] = [
  {
    id: "lecture-1",
    title: "Функции и графики",
    description:
      "Лекция знакомит с понятием функции, областью определения, чтением графиков и базовыми преобразованиями: сдвигами, растяжением и отражением.",
    blocks: [
      {
        id: "lecture-1-text",
        type: "text",
        title: "Краткая теория",
        payload: {
          markdown: [
            "# Функции и графики",
            "",
            "Функция сопоставляет каждому допустимому значению x ровно одно значение y.",
            "",
            "В этой лекции разбираются:",
            "- область определения и множество значений;",
            "- чтение графика по точкам;",
            "- нули функции и промежутки знакопостоянства;",
            "- преобразования графиков.",
            "",
            "Цель: научиться уверенно читать графики и понимать, как формула влияет на вид функции."
          ].join("\n")
        }
      },
      {
        id: "lecture-1-visual",
        type: "visual",
        title: "Визуализация графика",
        payload: {
          scene: {
            preset: "sin"
          },
          caption: "Пример интерактивного графика функции"
        }
      },
      {
        id: "lecture-1-quiz",
        type: "quiz",
        title: "Проверочный блок",
        payload: {
          timeLimitSec: 240,
          questions: [
            {
              id: "l1-q1",
              type: "single",
              text: "Что из перечисленного лучше всего описывает функцию?",
              options: [
                { id: "a", text: "Одному x могут соответствовать несколько y" },
                { id: "b", text: "Каждому допустимому x соответствует ровно одно y" },
                { id: "c", text: "Функция задаётся только таблицей" },
                { id: "d", text: "Функция всегда является прямой линией" }
              ],
              correctOptionId: "b",
              correctAnswerHint:
                "У функции каждому допустимому аргументу соответствует единственное значение."
            },
            {
              id: "l1-q2",
              type: "single",
              text: "Если график функции пересекает ось Ox в точке x = 3, то что это означает?",
              options: [
                { id: "a", text: "f(3) = 1" },
                { id: "b", text: "f(0) = 3" },
                { id: "c", text: "f(3) = 0" },
                { id: "d", text: "Функция не определена при x = 3" }
              ],
              correctOptionId: "c",
              correctAnswerHint: "Пересечение с осью Ox означает, что значение функции равно нулю."
            },
            {
              id: "l1-q3",
              type: "short",
              text: "Чему равно значение функции y = 2x + 1 при x = 4? Введите только число.",
              correctAnswerText: "9",
              correctAnswerHint: "Подставь x = 4 в выражение 2x + 1."
            },
            {
              id: "l1-q4",
              type: "single",
              text: "Как изменится график y = x², если перейти к y = x² + 3?",
              options: [
                { id: "a", text: "Сместится вверх на 3" },
                { id: "b", text: "Сместится вниз на 3" },
                { id: "c", text: "Сместится вправо на 3" },
                { id: "d", text: "Станет уже" }
              ],
              correctOptionId: "a",
              correctAnswerHint: "Прибавление числа к функции сдвигает график вверх."
            },
            {
              id: "l1-q5",
              type: "short",
              text: "Сколько нулей у функции y = x² - 1? Введите только число.",
              correctAnswerText: "2",
              correctAnswerHint: "Реши уравнение x² - 1 = 0."
            }
          ]
        } as QuizBlockPayload
      }
    ]
  },
  {
    id: "lecture-2",
    title: "Производная и касательная",
    description:
      "Лекция объясняет геометрический и физический смысл производной, связь с касательной и скорость изменения функции.",
    blocks: [
      {
        id: "lecture-2-text",
        type: "text",
        title: "Краткая теория",
        payload: {
          markdown: [
            "# Производная и касательная",
            "",
            "Производная показывает, как быстро меняется функция в данной точке.",
            "",
            "Основные идеи лекции:",
            "- геометрический смысл производной;",
            "- угловой коэффициент касательной;",
            "- связь производной и монотонности;",
            "- простейшие правила дифференцирования."
          ].join("\n")
        }
      },
      {
        id: "lecture-2-visual",
        type: "visual",
        title: "Касательная к графику",
        payload: {
          scene: {
            preset: "tangent"
          },
          caption: "Касательная и мгновенная скорость изменения"
        }
      },
      {
        id: "lecture-2-quiz",
        type: "quiz",
        title: "Проверочный блок",
        payload: {
          timeLimitSec: 300,
          questions: [
            {
              id: "l2-q1",
              type: "single",
              text: "Что геометрически показывает производная функции в точке?",
              options: [
                { id: "a", text: "Площадь под графиком" },
                { id: "b", text: "Угол наклона касательной" },
                { id: "c", text: "Число корней функции" },
                { id: "d", text: "Максимальное значение функции" }
              ],
              correctOptionId: "b",
              correctAnswerHint:
                "Производная связана с угловым коэффициентом касательной."
            },
            {
              id: "l2-q2",
              type: "short",
              text: "Найдите производную функции y = x². Ответ запишите как число при x = 3.",
              correctAnswerText: "6",
              correctAnswerHint: "Производная x² равна 2x."
            },
            {
              id: "l2-q3",
              type: "single",
              text: "Если f'(x) > 0 на промежутке, то функция на нём...",
              options: [
                { id: "a", text: "убывает" },
                { id: "b", text: "не определена" },
                { id: "c", text: "возрастает" },
                { id: "d", text: "постоянна" }
              ],
              correctOptionId: "c",
              correctAnswerHint: "Положительная производная указывает на возрастание."
            },
            {
              id: "l2-q4",
              type: "single",
              text: "Чему равна производная константы?",
              options: [
                { id: "a", text: "0" },
                { id: "b", text: "1" },
                { id: "c", text: "x" },
                { id: "d", text: "Она не существует" }
              ],
              correctOptionId: "a",
              correctAnswerHint: "Постоянная не меняется, её производная равна нулю."
            },
            {
              id: "l2-q5",
              type: "short",
              text: "Чему равна производная функции y = 5x + 2? Введите только число.",
              correctAnswerText: "5",
              correctAnswerHint: "Производная линейной функции ax + b равна a."
            }
          ]
        } as QuizBlockPayload
      }
    ]
  },
  {
    id: "lecture-3",
    title: "Векторы на плоскости",
    description:
      "Лекция вводит понятие вектора, координаты, длину, сложение, вычитание и базовое скалярное произведение.",
    blocks: [
      {
        id: "lecture-3-text",
        type: "text",
        title: "Краткая теория",
        payload: {
          markdown: [
            "# Векторы на плоскости",
            "",
            "Вектор характеризуется направлением и длиной.",
            "",
            "В этой лекции рассматриваются:",
            "- координаты вектора;",
            "- длина вектора;",
            "- сложение и вычитание;",
            "- коллинеарность;",
            "- скалярное произведение как инструмент сравнения направлений."
          ].join("\n")
        }
      },
      {
        id: "lecture-3-visual",
        type: "visual",
        title: "Интерактивная плоскость",
        payload: {
          scene: {
            preset: "vectors"
          },
          caption: "Векторы на координатной плоскости"
        }
      },
      {
        id: "lecture-3-quiz",
        type: "quiz",
        title: "Проверочный блок",
        payload: {
          timeLimitSec: 300,
          questions: [
            {
              id: "l3-q1",
              type: "short",
              text: "Чему равна длина вектора (3, 4)? Введите только число.",
              correctAnswerText: "5",
              correctAnswerHint: "Используй формулу √(x² + y²)."
            },
            {
              id: "l3-q2",
              type: "single",
              text: "Чему равна сумма векторов (1, 2) и (3, 4)?",
              options: [
                { id: "a", text: "(4, 6)" },
                { id: "b", text: "(3, 8)" },
                { id: "c", text: "(2, 2)" },
                { id: "d", text: "(1, 8)" }
              ],
              correctOptionId: "a",
              correctAnswerHint: "Складывай координаты по компонентам."
            },
            {
              id: "l3-q3",
              type: "single",
              text: "Какие векторы называются коллинеарными?",
              options: [
                { id: "a", text: "Те, у которых одинаковая длина" },
                { id: "b", text: "Те, что лежат на параллельных или одной прямой" },
                { id: "c", text: "Те, у которых координаты положительные" },
                { id: "d", text: "Те, что направлены только вверх" }
              ],
              correctOptionId: "b",
              correctAnswerHint: "Коллинеарные векторы параллельны одной прямой."
            },
            {
              id: "l3-q4",
              type: "short",
              text: "Найдите скалярное произведение векторов (1, 2) и (2, 3). Введите только число.",
              correctAnswerText: "8",
              correctAnswerHint: "Скалярное произведение: 1·2 + 2·3."
            },
            {
              id: "l3-q5",
              type: "single",
              text: "Чему равен вектор (5, 1) - (2, 3)?",
              options: [
                { id: "a", text: "(7, 4)" },
                { id: "b", text: "(3, -2)" },
                { id: "c", text: "(-3, 2)" },
                { id: "d", text: "(3, 2)" }
              ],
              correctOptionId: "b",
              correctAnswerHint: "Вычитай координаты по компонентам."
            }
          ]
        } as QuizBlockPayload
      }
    ]
  }
];

const sessions = new Map<string, SessionState>();

function getQuizBlock(lecture: LectureDetails, blockId: string): { id: string; type: "quiz"; title?: string; payload: QuizBlockPayload } | null {
  const block = lecture.blocks.find((item) => item.id === blockId && item.type === "quiz");
  if (!block || block.type !== "quiz") {
    return null;
  }

  return block as { id: string; type: "quiz"; title?: string; payload: QuizBlockPayload };
}

function evaluateSingleQuestion(
  question: QuizQuestion,
  answer: { questionId: string; payload: unknown } | undefined
): boolean {
  if (!answer) {
    return false;
  }

  if (question.type === "single") {
    const payload = answer.payload as { type?: string; optionId?: string };
    return payload?.type === "single" && payload.optionId === question.correctOptionId;
  }

  const payload = answer.payload as { type?: string; text?: string };
  return payload?.type === "short" &&
    typeof payload.text === "string" &&
    payload.text.trim().toLowerCase() === question.correctAnswerText.trim().toLowerCase();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vm-server-mock" });
});

app.post("/auth/login", (req, res) => {
  const { login, password } = req.body as { login?: string; password?: string };

  const user = USERS.find((item) => item.login === login && item.password === password);

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.json({
    accessToken: `access.mock.${user.id}`,
    refreshToken: `refresh.mock.${user.id}`,
    expiresInSec: 3600
  });
});

app.post("/auth/refresh", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken?.startsWith("refresh.mock.")) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }

  const userId = refreshToken.replace("refresh.mock.", "");

  res.json({
    accessToken: `access.mock.${userId}`,
    refreshToken: `refresh.mock.${userId}`,
    expiresInSec: 3600
  });
});

app.get("/lectures", (_req, res) => {
  res.json(
    LECTURES.map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      updatedAt: new Date().toISOString()
    }))
  );
});

app.get("/lectures/:id", (req, res) => {
  const lecture = LECTURES.find((item) => item.id === req.params.id);

  if (!lecture) {
    res.status(404).json({ message: "Lecture not found" });
    return;
  }

  res.json(lecture);
});

app.post("/sessions", (req, res) => {
  const { lectureId } = req.body as { lectureId?: string };
  const lecture = LECTURES.find((item) => item.id === lectureId);

  if (!lecture) {
    res.status(404).json({ message: "Lecture not found" });
    return;
  }

  const sessionId = `sess-${Date.now()}`;
  const firstQuizBlock = lecture.blocks.find((block) => block.type === "quiz");
  const state: SessionState = {
    sessionId,
    lectureId: lecture.id,
    activeBlockId: firstQuizBlock?.id ?? lecture.blocks[0]?.id ?? "",
    participants: [
      {
        userId: "u-2",
        fullName: "Тестовый преподаватель",
        role: "teacher",
        status: "connected",
        lastSeenAt: new Date().toISOString()
      },
      {
        userId: "u-1",
        fullName: "Тестовый студент",
        role: "student",
        status: "working",
        lastSeenAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };

  sessions.set(sessionId, state);
  res.status(201).json({ sessionId });
});

app.get("/sessions/:id", (req, res) => {
  const session = sessions.get(req.params.id);

  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(session);
});

app.post("/sessions/:id/activeBlock", (req, res) => {
  const session = sessions.get(req.params.id);

  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const { blockId } = req.body as { blockId?: string };

  if (!blockId) {
    res.status(400).json({ message: "blockId is required" });
    return;
  }

  session.activeBlockId = blockId;
  session.updatedAt = new Date().toISOString();

  sessions.set(session.sessionId, session);
  res.status(204).send();
});

app.post("/quiz/submit", (req, res) => {
  const body = req.body as {
    sessionId?: string;
    blockId?: string;
    answers?: Array<{ questionId: string; payload: unknown }>;
  };

  if (!body.sessionId || !body.blockId || !Array.isArray(body.answers) || body.answers.length === 0) {
    res.status(400).json({ message: "Invalid quiz submission" });
    return;
  }

  const session = sessions.get(body.sessionId);

  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const lecture = LECTURES.find((item) => item.id === session.lectureId);

  if (!lecture) {
    res.status(404).json({ message: "Lecture not found" });
    return;
  }

  const quizBlock = getQuizBlock(lecture, body.blockId);

  if (!quizBlock) {
    res.status(404).json({ message: "Quiz block not found" });
    return;
  }

  const questions = quizBlock.payload.questions;
  const score = questions.reduce((sum, question) => {
    const answer = body.answers?.find((item) => item.questionId === question.id);
    return sum + (evaluateSingleQuestion(question, answer) ? 1 : 0);
  }, 0);

  session.updatedAt = new Date().toISOString();
  session.participants = session.participants.map((participant) =>
    participant.role === "student"
      ? {
          ...participant,
          status: "submitted",
          lastSeenAt: new Date().toISOString()
        }
      : participant
  );

  sessions.set(session.sessionId, session);

  res.json({
    attemptId: `attempt-${Date.now()}`,
    score,
    maxScore: questions.length,
    checkedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`VM mock server is running on http://localhost:${PORT}`);
});