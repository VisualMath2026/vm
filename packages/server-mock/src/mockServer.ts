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
    fullName: "Test Student"
  },
  {
    id: "u-2",
    login: "teacher",
    password: "teacher",
    role: "teacher" as Role,
    fullName: "Test Teacher"
  }
];

const LECTURES: LectureDetails[] = [
  {
    id: "lec-1",
    title: "Functions and Graphs",
    description: "Introduction to sin/cos and interactive graphs",
    blocks: [
      {
        id: "b-1",
        type: "text",
        title: "Theory",
        payload: { markdown: "# Functions\nBasic introduction to functions." }
      },
      {
        id: "b-2",
        type: "visual",
        title: "Visual demo",
        payload: { scene: { preset: "sin" }, caption: "Sine graph" }
      },
      {
        id: "b-3",
        type: "quiz",
        title: "Quick quiz",
        payload: {
          questions: [
            {
              id: "q1",
              type: "single",
              text: "sin(0) = ?",
              options: [
                { id: "a", text: "0" },
                { id: "b", text: "1" }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    id: "lec-2",
    title: "Derivative Basics",
    description: "Introductory derivative lecture",
    blocks: [
      {
        id: "b-1",
        type: "text",
        title: "Definition",
        payload: { markdown: "# Derivative\nLimit definition of derivative." }
      }
    ]
  }
];

const sessions = new Map<string, SessionState>();

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

  const state: SessionState = {
    sessionId,
    lectureId: lecture.id,
    activeBlockId: lecture.blocks[0]?.id ?? "",
    participants: [
      {
        userId: "u-2",
        fullName: "Test Teacher",
        role: "teacher",
        status: "connected",
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

  res.json({
    attemptId: `attempt-${Date.now()}`,
    score: 1,
    maxScore: 1,
    checkedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`VM mock server is running on http://localhost:${PORT}`);
});
