import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { LectureDetails, QuizBlock, QuizQuestion, TextBlock } from "@vm/shared";
import { createMockSession, evaluateSubmission, type SessionData, type TaskResult, type TaskSubmission } from "../mocks/session";
import { clearTeacherParticipants, createTeacherManagedSession, moveTeacherSessionBlock, updateTeacherSessionStatus, type TeacherManagedSession } from "../mocks/teacher";
import { mockLectures, type LectureItem } from "../mocks/lectures";
import { mockUser, type UserProfile } from "../mocks/user";
import { CatalogScreen } from "../screens/CatalogScreen";
import { LectureDetailsScreen } from "../screens/LectureDetailsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SessionScreen } from "../screens/SessionScreen";
import { SolverScreen } from "../screens/SolverScreen";
import { TaskResultScreen } from "../screens/TaskResultScreen";
import { TaskScreen } from "../screens/TaskScreen";
import { TeacherHomeScreen, type DraftLectureInput, type DraftLectureMetaInput, type DraftQuestionInput } from "../screens/TeacherHomeScreen";
import { TeacherSessionControlScreen } from "../screens/TeacherSessionControlScreen";
import {
  clearAuthSession,
  readAuthMeta,
  writeAuthMeta
} from "../storage/authStorage";
import {
  readCatalogSnapshot,
  readLastLectureId,
  readNotificationsEnabled,
  readThemeMode,
  writeCatalogSnapshot,
  writeLastLectureId,
  writeNotificationsEnabled,
  writeThemeMode
} from "../storage/mobileCache";
import { createAppTheme, type AppTheme, type ThemeMode } from "../theme";
import { authApi, catalogApi, quizApi, sessionApi, toUserMessage } from "../api/mobileApi";
import {
  mapLectureDetailsToLectureItem,
  mapLectureSummaryToLectureItem,
  mapQuizResponseToTaskResult,
  mapSessionToSessionData,
  mapSessionToTeacherManagedSession,
  mapTaskAnswerToApiPayload
} from "../api/mappers";

type ScreenKey =
  | "catalog"
  | "details"
  | "session"
  | "task"
  | "result"
  | "teacherHome"
  | "teacherSession"
    | "solver"
  | "profile";

type LoginRole = "student" | "teacher";
type DemoDataMode = "online" | "offline" | "loading" | "error";

function nextMode(currentMode: DemoDataMode): DemoDataMode {
  if (currentMode === "online") {
    return "offline";
  }

  if (currentMode === "offline") {
    return "loading";
  }

  if (currentMode === "loading") {
    return "error";
  }

  return "online";
}

function upsertLecture(lectures: LectureItem[], lecture: LectureItem): LectureItem[] {
  const existingIndex = lectures.findIndex((item) => item.id === lecture.id);

  if (existingIndex === -1) {
    return [...lectures, lecture];
  }

  const next = [...lectures];
  next[existingIndex] = lecture;
  return next;
}


function createDraftLectureItem(
  lectureId: string,
  input: DraftLectureInput,
  author: string
): LectureItem {
  return {
    id: lectureId,
    title: input.title,
    author: "Visual Math Team",
    subject: input.subject,
    semester: input.semester,
    level: input.level,
    tags: ["draft", "teacher"],
    description: input.description,
    blocks: ["Theory", "Questions"],
    participationRequirements: ["Visual Math Team"],
    estimatedDuration: "15 минут"
  };
}

function createDraftLectureDetails(
  lectureId: string,
  input: DraftLectureInput
): LectureDetails {
  const theoryBlock: TextBlock = {
    id: `${lectureId}-theory`,
    type: "text",
    title: "Theory",
    payload: {
      markdown: input.theory
    }
  };

  const quizBlock: QuizBlock = {
    id: `${lectureId}-quiz`,
    type: "quiz",
    title: "Questions",
    payload: {
      questions: []
    }
  };

  return {
    id: lectureId,
    title: input.title,
    description: input.description,
    blocks: [theoryBlock, quizBlock]
  };
}

function ensureEditableLectureDetails(
  lecture: LectureItem | null,
  details?: LectureDetails | null
): LectureDetails | null {
  if (details) {
    return details;
  }

  if (!lecture) {
    return null;
  }

  const theoryBlock: TextBlock = {
    id: `${lecture.id}-theory`,
    type: "text",
    title: "Theory",
    payload: {
      markdown: lecture.description || ""
    }
  };

  const quizBlock: QuizBlock = {
    id: `${lecture.id}-quiz`,
    type: "quiz",
    title: "Questions",
    payload: {
      questions: []
    }
  };

  return {
    id: lecture.id,
    title: lecture.title,
    description: lecture.description,
    blocks: [theoryBlock, quizBlock]
  };
}

function withQuestionAdded(
  details: LectureDetails,
  input: DraftQuestionInput
): LectureDetails {
  const questionId = `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const question: QuizQuestion = {
    id: questionId,
    type: "single",
    text: input.text,
    options: [
      { id: "A", text: input.optionA },
      { id: "B", text: input.optionB },
      { id: "C", text: input.optionC },
      { id: "D", text: input.optionD }
    ],
    correctAnswerHint: input.explanation
      ? `Correct answer: ${input.correctOptionKey}. ${input.explanation}`
      : `Correct answer: ${input.correctOptionKey}.`
  };

  let quizFound = false;

  const nextBlocks = details.blocks.map((block) => {
    if (block.type !== "quiz") {
      return block;
    }

    quizFound = true;

    return {
      ...block,
      payload: {
        ...block.payload,
        questions: [...block.payload.questions, question]
      }
    };
  });

  if (!quizFound) {
    nextBlocks.push({
      id: `${details.id}-quiz`,
      type: "quiz",
      title: "Questions",
      payload: {
        questions: [question]
      }
    } as QuizBlock);
  }

  return {
    ...details,
    blocks: nextBlocks
  };
}

function withQuestionDeleted(details: LectureDetails, questionId: string): LectureDetails {
  return {
    ...details,
    blocks: details.blocks.map((block) => {
      if (block.type !== "quiz") {
        return block;
      }

      return {
        ...block,
        payload: {
          ...block.payload,
          questions: block.payload.questions.filter((question) => question.id !== questionId)
        }
      };
    })
  };
}


const DRAFT_LECTURES_STORAGE_KEY = "vm_mobile_draft_lectures_v900";

type DraftStorageShape = {
  lectures: LectureItem[];
  lectureDetailsById: Record<string, LectureDetails>;
};

function readDraftStorage(): DraftStorageShape | null {
  try {
    const storage = (globalThis as {
      localStorage?: {
        getItem: (key: string) => string | null;
      };
    }).localStorage;

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(DRAFT_LECTURES_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as DraftStorageShape;

    return {
      lectures: Array.isArray(parsed.lectures) ? parsed.lectures : [],
      lectureDetailsById:
        parsed.lectureDetailsById && typeof parsed.lectureDetailsById === "object"
          ? parsed.lectureDetailsById
          : {}
    };
  } catch {
    return null;
  }
}

function writeDraftStorage(payload: DraftStorageShape) {
  try {
    const storage = (globalThis as {
      localStorage?: {
        setItem: (key: string, value: string) => void;
      };
    }).localStorage;

    if (!storage) {
      return;
    }

    storage.setItem(DRAFT_LECTURES_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function mergeDraftLectures(base: LectureItem[], drafts: LectureItem[]): LectureItem[] {
  const next = new Map<string, LectureItem>();

  for (const lecture of base) {
    next.set(lecture.id, lecture);
  }

  for (const lecture of drafts) {
    next.set(lecture.id, lecture);
  }

  return Array.from(next.values());
}

function pickDraftLectureDetails(
  details: Record<string, LectureDetails>
): Record<string, LectureDetails> {
  return Object.fromEntries(
    Object.entries(details).filter(([lectureId]) => lectureId.startsWith("draft-lecture-"))
  );
}


const WEB_DRAFTS_KEY_V4 = "vm_mobile_web_drafts_v900";

type WebDraftStateV4 = {
  lectures: LectureItem[];
  lectureDetailsById: Record<string, LectureDetails>;
};

function isDraftLectureV4(lectureId: string): boolean {
  return lectureId.startsWith("draft-lecture-");
}

function readWebDraftStateV4(): WebDraftStateV4 {
  try {
    const storage = (globalThis as {
      localStorage?: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
      };
    }).localStorage;

    if (!storage) {
      return { lectures: [], lectureDetailsById: {} };
    }

    const raw = storage.getItem(WEB_DRAFTS_KEY_V4);

    if (!raw) {
      return { lectures: [], lectureDetailsById: {} };
    }

    const parsed = JSON.parse(raw) as WebDraftStateV4;

    return {
      lectures: Array.isArray(parsed.lectures) ? parsed.lectures : [],
      lectureDetailsById:
        parsed.lectureDetailsById && typeof parsed.lectureDetailsById === "object"
          ? parsed.lectureDetailsById
          : {}
    };
  } catch {
    return { lectures: [], lectureDetailsById: {} };
  }
}

function writeWebDraftStateV4(payload: WebDraftStateV4) {
  try {
    const storage = (globalThis as {
      localStorage?: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
      };
    }).localStorage;

    if (!storage) {
      return;
    }

    storage.setItem(WEB_DRAFTS_KEY_V4, JSON.stringify(payload));
  } catch {}
}

function mergeWithDraftsV4(base: LectureItem[], drafts: LectureItem[]): LectureItem[] {
  const next = new Map<string, LectureItem>();

  for (const lecture of base) {
    next.set(lecture.id, lecture);
  }

  for (const lecture of drafts) {
    next.set(lecture.id, lecture);
  }

  return Array.from(next.values());
}

function persistDraftsV4(
  lectures: LectureItem[],
  lectureDetailsById: Record<string, LectureDetails>
) {
  writeWebDraftStateV4({
    lectures: lectures.filter((lecture) => isDraftLectureV4(lecture.id)),
    lectureDetailsById: Object.fromEntries(
      Object.entries(lectureDetailsById).filter(([lectureId]) => isDraftLectureV4(lectureId))
    )
  });
}


function isDraftLecture(lectureId: string): boolean {
  return lectureId.startsWith("draft-lecture-");
}

function mergeDraftLecturesIntoCatalog(
  apiLectures: LectureItem[],
  currentLectures: LectureItem[]
): LectureItem[] {
  const next = new Map<string, LectureItem>();

  for (const lecture of apiLectures) {
    next.set(lecture.id, lecture);
  }

  for (const lecture of currentLectures) {
    if (isDraftLecture(lecture.id)) {
      next.set(lecture.id, lecture);
    }
  }

  return Array.from(next.values());
}


const TEACHER_STATS_KEY = "vm.teacher.session.stats.v1";

type TeacherSessionStatsRecord = Record<
  string,
  {
    completed: number;
    totalScore: number;
    lastCorrectCount: number;
    updatedAt: string;
  }
>;

function readTeacherSessionStats(): TeacherSessionStatsRecord {
  try {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    if (!storage) {
      return {};
    }

    const raw = storage.getItem(TEACHER_STATS_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as TeacherSessionStatsRecord;
  } catch {
    return {};
  }
}

function writeTeacherSessionStats(value: TeacherSessionStatsRecord) {
  try {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    if (!storage) {
      return;
    }

    storage.setItem(TEACHER_STATS_KEY, JSON.stringify(value));
  } catch {}
}

function resetTeacherSessionStats(lectureId: string) {
  const current = readTeacherSessionStats();
  current[lectureId] = {
    completed: 0,
    totalScore: 0,
    lastCorrectCount: 0,
    updatedAt: new Date().toISOString()
  };
  writeTeacherSessionStats(current);
}

function appendTeacherSessionResult(lectureId: string, correctCount: number) {
  const current = readTeacherSessionStats();
  const previous = current[lectureId] ?? {
    completed: 0,
    totalScore: 0,
    lastCorrectCount: 0,
    updatedAt: new Date().toISOString()
  };

  current[lectureId] = {
    completed: previous.completed + 1,
    totalScore: previous.totalScore + correctCount,
    lastCorrectCount: correctCount,
    updatedAt: new Date().toISOString()
  };

  writeTeacherSessionStats(current);
}

export function AppNavigation() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("catalog");

  const [user, setUser] = useState<UserProfile>(mockUser);
  const [catalogLectures, setCatalogLectures] = useState<LectureItem[]>(mockLectures);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);
  const [lastOpenedLectureId, setLastOpenedLectureId] = useState<string | null>(null);

  const [lectureDetailsById, setLectureDetailsById] = useState<Record<string, LectureDetails>>({});
  const [draftsLoaded, setDraftsLoaded] = useState(false);

  useEffect(() => {
    const savedDrafts = readDraftStorage();

    if (savedDrafts) {
      setCatalogLectures((current) => mergeDraftLectures(current, savedDrafts.lectures));
      setLectureDetailsById((current) => ({
        ...current,
        ...savedDrafts.lectureDetailsById
      }));
    }

    setDraftsLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftsLoaded) {
      return;
    }

    writeDraftStorage({
      lectures: catalogLectures.filter((lecture) => lecture.id.startsWith("draft-lecture-")),
      lectureDetailsById: pickDraftLectureDetails(lectureDetailsById)
    });
  }, [draftsLoaded, catalogLectures, lectureDetailsById]);

  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);
  const [currentTeacherSession, setCurrentTeacherSession] = useState<TeacherManagedSession | null>(null);

  const [catalogMode, setCatalogMode] = useState<DemoDataMode>("loading");
  const [sessionMode, setSessionMode] = useState<DemoDataMode>("online");
  const [isHydrating, setIsHydrating] = useState(true);

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);
  const isTeacher = user.role === "teacher";

  useEffect(() => {
    let isMounted = true;

    async function hydrateAppState() {
      try {
        const [
          cachedLectures,
          cachedLastLectureId,
          cachedThemeMode,
          cachedNotificationsEnabled,
          storedAuthMeta
        ] = await Promise.all([
          readCatalogSnapshot(),
          readLastLectureId(),
          readThemeMode(),
          readNotificationsEnabled(),
          readAuthMeta()
        ]);

        if (!isMounted) {
          return;
        }

        const webDraftState = readWebDraftStateV4();

        if (cachedLectures && cachedLectures.length > 0) {
          setCatalogLectures(mergeWithDraftsV4(cachedLectures, webDraftState.lectures));
          setCatalogMode("offline");
        } else {
          setCatalogLectures(mergeWithDraftsV4(mockLectures, webDraftState.lectures));
        }

        if (Object.keys(webDraftState.lectureDetailsById).length > 0) {
          setLectureDetailsById((current) => ({
            ...current,
            ...webDraftState.lectureDetailsById
          }));
        }

        if (cachedLastLectureId) {
          setLastOpenedLectureId(cachedLastLectureId);
        }

        if (cachedThemeMode) {
          setThemeMode(cachedThemeMode);
        }

        if (typeof cachedNotificationsEnabled === "boolean") {
          setNotificationsEnabled(cachedNotificationsEnabled);
        }

        if (storedAuthMeta?.userLogin) {
          setUser({
            fullName: storedAuthMeta.fullName || mockUser.fullName,
            login: storedAuthMeta.userLogin,
            role: storedAuthMeta.role,
            group: storedAuthMeta.group || mockUser.group
          });
          setIsAuthenticated(true);
          setActiveScreen(storedAuthMeta.role === "teacher" ? "teacherHome" : "catalog");

          try {
            const summaries = await catalogApi.listLectures();
            if (!isMounted) {
              return;
            }

            const nextLectures = summaries.map((summary) =>
              mapLectureSummaryToLectureItem(
                summary,
                cachedLectures?.find((item) => item.id === summary.id)
              )
            );

            const webDraftState = readWebDraftStateV4();
            const mergedLectures = mergeWithDraftsV4(nextLectures, webDraftState.lectures);

            setCatalogLectures(mergedLectures);
            setLectureDetailsById((current) => ({
              ...current,
              ...webDraftState.lectureDetailsById
            }));
            setCatalogMode("online");
            await writeCatalogSnapshot(mergedLectures);
          } catch {
            setCatalogMode(cachedLectures?.length ? "offline" : "error");
          }
        } else {
          setCatalogMode(cachedLectures?.length ? "offline" : "error");
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    void hydrateAppState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void writeCatalogSnapshot(catalogLectures);
  }, [catalogLectures, isHydrating]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    persistDraftsV4(catalogLectures, lectureDetailsById);
  }, [catalogLectures, lectureDetailsById, isHydrating]);


  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void writeThemeMode(themeMode);
  }, [themeMode, isHydrating]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void writeNotificationsEnabled(notificationsEnabled);
  }, [notificationsEnabled, isHydrating]);

  async function refreshCatalogFromApi() {
    setCatalogMode("loading");

    try {
      const summaries = await catalogApi.listLectures();

      const nextLectures = summaries.map((summary) =>
        mapLectureSummaryToLectureItem(
          summary,
          catalogLectures.find((item) => item.id === summary.id)
        )
      );

      const mergedLectures = mergeDraftLecturesIntoCatalog(nextLectures, catalogLectures);

      setCatalogLectures(mergedLectures);

      setCatalogMode("online");

      await writeCatalogSnapshot(mergedLectures);
    } catch {
      setCatalogMode(catalogLectures.length > 0 ? "offline" : "error");
    }
  }

  async function ensureLectureDetails(lecture: LectureItem): Promise<LectureDetails | null> {
    const cachedDetails = lectureDetailsById[lecture.id];
    if (cachedDetails) {
      return cachedDetails;
    }

    try {
      const details = await catalogApi.getLecture(lecture.id);

      setLectureDetailsById((current) => ({
        ...current,
        [lecture.id]: details
      }));

      const mappedLecture = mapLectureDetailsToLectureItem(details, lecture);
      setCatalogLectures((current) => upsertLecture(current, mappedLecture));
      setSelectedLecture(mappedLecture);

      return details;
    } catch {
      return null;
    }
  }

  async function handleLogin(
  login: string,
  password: string,
  role: LoginRole
): Promise<string | null> {
  if (!login.trim() || !password.trim()) {
    return "Р’РІРµРґРёС‚Рµ Р»РѕРіРёРЅ Рё РїР°СЂРѕР»СЊ.";
  }

  const nextUser: UserProfile = {
    fullName:
      role === "teacher"
        ? "РўРµСЃС‚РѕРІС‹Р№ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЊ"
        : "РўРµСЃС‚РѕРІС‹Р№ СЃС‚СѓРґРµРЅС‚",
    login: login.trim(),
    role,
    group: mockUser.group
  };

  await writeAuthMeta({
    userLogin: nextUser.login,
    role,
    fullName: nextUser.fullName,
    group: nextUser.group
  });

  setUser(nextUser);
  setIsAuthenticated(true);
  setActiveScreen(role === "teacher" ? "teacherHome" : "catalog");

  try {
    await refreshCatalogFromApi();
  } catch {}

  return null;
}

function resetStudentFlow() {
    setSelectedLecture(null);
    setCurrentSession(null);
    setCurrentResult(null);
    setSessionMode("online");
  }

  function resetTeacherFlow() {
    setCurrentTeacherSession(null);
  }

  

  function handleUpdateDraftLectureMeta(lectureId: string, input: DraftLectureMetaInput) {
    setCatalogLectures((current) =>
      current.map((lecture) =>
        lecture.id === lectureId
          ? {
              ...lecture,
              subject: input.subject,
              semester: input.semester,
              level: input.level
            }
          : lecture
      )
    );
  }

  function handleDeleteLecture(lectureId: string) {
    setCatalogLectures((current) => current.filter((lecture) => lecture.id !== lectureId));

    setLectureDetailsById((current) => {
      const next = { ...current };
      delete next[lectureId];
      return next;
    });

    setSelectedLecture((current) => (current?.id === lectureId ? null : current));
    setLastOpenedLectureId((current) => (current === lectureId ? null : current));
  }

  function handleCreateDraftLecture(input: DraftLectureInput): string | null {
    const lectureId = `draft-lecture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextLecture = createDraftLectureItem(lectureId, input, user.fullName);
    const nextDetails = createDraftLectureDetails(lectureId, input);

    setCatalogLectures((current) => upsertLecture(current, nextLecture));
    setLectureDetailsById((current) => ({
      ...current,
      [lectureId]: nextDetails
    }));
    setSelectedLecture(nextLecture);
    setLastOpenedLectureId(lectureId);
    void writeLastLectureId(lectureId);

    return lectureId;
  }

      function handleAddDraftQuestion(lectureId: string, input: DraftQuestionInput) {
    const lecture = catalogLectures.find((item) => item.id === lectureId) ?? null;

    setLectureDetailsById((current) => {
      const editable = ensureEditableLectureDetails(lecture, current[lectureId]);

      if (!editable) {
        return current;
      }

      const questionId = `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const correctOptionId = String(input.correctOptionKey).trim().toUpperCase();

      const nextQuestion: QuizQuestion = {
        id: questionId,
        type: "single",
        text: input.text,
        options: [
          { id: "A", text: input.optionA },
          { id: "B", text: input.optionB },
          { id: "C", text: input.optionC },
          { id: "D", text: input.optionD }
        ],
        correctAnswerHint: input.explanation
          ? `Correct answer: ${String(input.correctOptionKey).trim().toUpperCase()}. ${input.explanation}`
          : `Correct answer: ${String(input.correctOptionKey).trim().toUpperCase()}.`
      };

      (nextQuestion as QuizQuestion & { correctOptionId?: string }).correctOptionId =
        String(input.correctOptionKey).trim().toUpperCase();

      let quizFound = false;

      const nextBlocks = editable.blocks.map((block) => {
        if (block.type !== "quiz") {
          return block;
        }

        quizFound = true;

        return {
          ...block,
          payload: {
            ...block.payload,
            questions: [...block.payload.questions, nextQuestion]
          }
        };
      });

      if (!quizFound) {
        nextBlocks.push({
          id: `${lectureId}-quiz`,
          type: "quiz",
          title: "Questions",
          payload: {
            questions: [nextQuestion]
          }
        } as QuizBlock);
      }

      return {
        ...current,
        [lectureId]: {
          ...editable,
          blocks: nextBlocks
        }
      };
    });
  }

function handleDeleteDraftQuestion(lectureId: string, questionId: string) {
    const lecture = catalogLectures.find((item) => item.id === lectureId) ?? null;

    setLectureDetailsById((current) => {
      const editable = ensureEditableLectureDetails(lecture, current[lectureId]);
      if (!editable) {
        return current;
      }

      return {
        ...current,
        [lectureId]: withQuestionDeleted(editable, questionId)
      };
    });
  }

async function handleLogout() {
    setIsAuthenticated(false);
    setActiveScreen("catalog");
    setSelectedLecture(null);
    setCurrentSession(null);
    setCurrentResult(null);
    setCurrentTeacherSession(null);
    setLastOpenedLectureId(null);
    setLectureDetailsById((current) => pickDraftLectureDetails(current));
    setUser(mockUser);

    try {
      await clearAuthSession();
    } catch {}

    try {
      await authApi.logout();
    } catch {}
  }

  async function handleOpenLecture(lecture: LectureItem) {

      setSelectedLecture(lecture);
      setLastOpenedLectureId(lecture.id);
      void writeLastLectureId(lecture.id);
      setCurrentSession(null);
      setCurrentResult(null);
      setActiveScreen("details");

      const details = await ensureLectureDetails(lecture);
      if (!details) {
        setCatalogMode("offline");
      }
    }

  function handleBackToCatalog() {
    resetStudentFlow();
    setActiveScreen("catalog");
  }

  async function handleOpenSession() {
      if (!selectedLecture) {
        return;
      }

      setSessionMode("loading");

      const details =
        lectureDetailsById[selectedLecture.id] ?? (await ensureLectureDetails(selectedLecture));

      if (selectedLecture.id.startsWith("draft-lecture-")) {
        setCurrentSession(createMockSession(selectedLecture, details));
        setCurrentResult(null);
        setSessionMode("online");
        setActiveScreen("session");
        return;
      }

      if (!details) {
        setCurrentSession(createMockSession(selectedLecture));
        setCurrentResult(null);
        setSessionMode("offline");
        setActiveScreen("session");
        return;
      }

      try {
        const sessionState = await sessionApi.getSession(selectedLecture.id);
        const mappedSession = mapSessionToSessionData({
          lecture: selectedLecture,
          details,
          sessionState
        });

        setCurrentSession(mappedSession);
        setCurrentResult(null);
        setSessionMode("online");
        setActiveScreen("session");
      } catch {
        setCurrentSession(createMockSession(selectedLecture, details));
        setCurrentResult(null);
        setSessionMode("offline");
        setActiveScreen("session");
      }
    }

    function handleBackToLecture() {
    setCurrentResult(null);
    setActiveScreen("details");
  }

  function handleOpenTask() {
    if (!currentSession) {
      return;
    }

    setActiveScreen("task");
  }

  async function handleSubmitTask(submission: TaskSubmission) {
      if (!currentSession) {
        return;
      }

      const result = evaluateSubmission(currentSession, submission);

      appendTeacherSessionResult(currentSession.lectureId, result.correctCount);

      setCurrentResult(result);
      setActiveScreen("result");

      if (currentTeacherSession && currentTeacherSession.lectureId === currentSession.lectureId) {
        setCurrentTeacherSession((current) => {
          if (!current) {
            return current;
          }

          const participantIndex = current.participants.findIndex(
            (participant) =>
              participant.status === "online" || participant.status === "in-progress"
          );

          if (participantIndex === -1) {
            return current;
          }

          const nextParticipants = current.participants.map((participant, index) =>
            index === participantIndex
              ? {
                  ...participant,
                  status: "completed" as const,
                  score: result.correctCount
                }
              : participant
          );

          return {
            ...current,
            participants: nextParticipants
          };
        });
      }
    }

    function handleBackToSession() {
    setActiveScreen("session");
  }

  async function handleOpenManageTeacherSession(lecture: LectureItem) {
    const details = lectureDetailsById[lecture.id];

    const quizQuestions =
      details?.blocks
        .filter((block) => block.type === "quiz")
        .flatMap((block) =>
          block.type === "quiz" ? block.payload.questions : []
        ) ?? [];

    setSelectedLecture(lecture);
    setCurrentTeacherSession(createTeacherManagedSession(lecture, quizQuestions));
    setActiveScreen("teacherSession");
  }

  function handleBackToTeacherHome() {
    resetTeacherFlow();
    setActiveScreen("teacherHome");
  }

  function handleTeacherStartSession() {
      if (!currentTeacherSession) {
        return;
      }

      resetTeacherSessionStats(currentTeacherSession.lectureId);
      setCurrentTeacherSession(updateTeacherSessionStatus(currentTeacherSession, "active"));
    }

  function handleTeacherStopSession() {
    if (!currentTeacherSession) {
      return;
    }

    setCurrentTeacherSession(updateTeacherSessionStatus(currentTeacherSession, "stopped"));
  }

  async function handleTeacherMoveBlock(direction: "prev" | "next") {
    if (!currentTeacherSession) {
      return;
    }

    const details = lectureDetailsById[currentTeacherSession.lectureId];

    if (!details) {
      setCurrentTeacherSession(moveTeacherSessionBlock(currentTeacherSession, direction));
      return;
    }

    const nextIndex =
      direction === "next"
        ? Math.min(currentTeacherSession.currentBlockIndex + 1, details.blocks.length - 1)
        : Math.max(currentTeacherSession.currentBlockIndex - 1, 0);

    const nextBlock = details.blocks[nextIndex];
    if (!nextBlock) {
      return;
    }

    try {
      await sessionApi.setActiveBlock(currentTeacherSession.sessionId, nextBlock.id);
      setCurrentTeacherSession({
        ...currentTeacherSession,
        currentBlockIndex: nextIndex
      });
    } catch {
      setCurrentTeacherSession(moveTeacherSessionBlock(currentTeacherSession, direction));
    }
  }

  function handleBottomTabChange(
      screen: "catalog" | "teacher" | "solver" | "profile"
    ) {
      if (screen === "profile") {
        resetTeacherFlow();
        setActiveScreen("profile");
        return;
      }

      if (screen === "solver") {
        resetStudentFlow();
        resetTeacherFlow();
        setActiveScreen("solver");
        return;
      }

      if (screen === "teacher") {
        resetTeacherFlow();
        setActiveScreen("teacherHome");
        return;
      }

      handleBackToCatalog();
    }

  if (isHydrating) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen theme={theme} onLogin={handleLogin} />;
  }

  const lastOpenedLecture =
    catalogLectures.find((lecture) => lecture.id === lastOpenedLectureId) ?? null;

  const activeBottomTab: "catalog" | "teacher" | "profile" = isTeacher
    ? activeScreen === "profile"
      ? "profile"
      : "teacher"
    : activeScreen === "profile"
      ? "profile"
      : "catalog";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!isTeacher && activeScreen === "catalog" ? (
          <CatalogScreen
            theme={theme}
            lectures={catalogLectures}
            lastOpenedLecture={lastOpenedLecture}
            isLoading={catalogMode === "loading"}
            hasError={catalogMode === "error"}
            isOffline={catalogMode === "offline"}
            onRetry={() => void refreshCatalogFromApi()}
            onOpenLecture={(lecture) => void handleOpenLecture(lecture)}
          />
        ) : null}

        {!isTeacher && activeScreen === "details" && selectedLecture ? (
          <LectureDetailsScreen
            theme={theme}
            lecture={selectedLecture}
            lectureDetails={lectureDetailsById[selectedLecture.id] ?? null}
            onBack={handleBackToCatalog}
            onOpenSession={() => void handleOpenSession()}
          />
        ) : null}

        {!isTeacher && activeScreen === "session" && selectedLecture && currentSession ? (
          <SessionScreen
            theme={theme}
            lecture={selectedLecture}
            session={currentSession}
            isOffline={sessionMode === "offline"}
            hasError={sessionMode === "error"}
            onRetry={() => void handleOpenSession()}
            onBack={handleBackToLecture}
            onOpenTask={handleOpenTask}
          />
        ) : null}

        {!isTeacher && activeScreen === "task" && currentSession ? (
          <TaskScreen
            theme={theme}
            session={currentSession}
            onBack={handleBackToSession}
            onSubmit={(submission) => void handleSubmitTask(submission)}
          />
        ) : null}

        {!isTeacher && activeScreen === "result" && currentResult ? (
          <TaskResultScreen
            theme={theme}
            result={currentResult}
            onBackToSession={handleBackToSession}
            onFinish={handleBackToCatalog}
          />
        ) : null}

        {isTeacher && activeScreen === "teacherHome" ? (
          <TeacherHomeScreen
            theme={theme}
            user={user}
            lectures={catalogLectures}
            lectureDetailsById={lectureDetailsById}
            onOpenManageSession={(lecture) => void handleOpenManageTeacherSession(lecture)}
            onCreateDraftLecture={handleCreateDraftLecture}
            onUpdateDraftLectureMeta={handleUpdateDraftLectureMeta}
            onAddDraftQuestion={handleAddDraftQuestion}
            onDeleteDraftQuestion={handleDeleteDraftQuestion}
            onDeleteLecture={handleDeleteLecture}
            onLogout={() => void handleLogout()}
          />
        ) : null}

        {isTeacher && activeScreen === "teacherSession" && currentTeacherSession ? (
          <TeacherSessionControlScreen
            theme={theme}
            session={currentTeacherSession}
            onBack={handleBackToTeacherHome}
            onStart={handleTeacherStartSession}
            onStop={handleTeacherStopSession}
            onPrevBlock={() => void handleTeacherMoveBlock("prev")}
            onNextBlock={() => void handleTeacherMoveBlock("next")}
          />
        ) : null}

        {activeScreen === "solver" ? (
            <SolverScreen
              theme={theme}
              onBack={handleBackToCatalog}
            />
          ) : null}

          {activeScreen === "profile" ? (
          <ProfileScreen
            theme={theme}
            user={user}
            themeMode={themeMode}
            notificationsEnabled={notificationsEnabled}
            catalogMode={catalogMode}
            sessionMode={sessionMode}
            onToggleTheme={() =>
              setThemeMode((currentMode) =>
                currentMode === "light" ? "dark" : "light"
              )
            }
            onToggleNotifications={() =>
              setNotificationsEnabled((currentValue) => !currentValue)
            }
            onCycleCatalogMode={() =>
              setCatalogMode((currentMode) => nextMode(currentMode))
            }
            onCycleSessionMode={() =>
              setSessionMode((currentMode) => nextMode(currentMode))
            }
            onLogout={() => { void handleLogout(); }}
          />
        ) : null}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface
        }}
      >
        {(isTeacher
          ? [
              { key: "catalog", label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" },
              { key: "teacher", label: "\u041F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u044C" },
              { key: "solver", label: "\u0423\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F" },
              { key: "profile", label: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" }
            ]
          : [
              { key: "catalog", label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" },
              { key: "solver", label: "\u0423\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F" },
              { key: "profile", label: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" }
            ]
        ).map((item) => {
          const isActive = activeScreen === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() =>
                handleBottomTabChange(
                  item.key as "catalog" | "teacher" | "solver" | "profile"
                )
              }
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.md,
                backgroundColor: isActive
                  ? theme.colors.surfaceMuted
                  : theme.colors.surface
              }}
            >
              <Text
                style={{
                  color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                  fontSize: theme.typography.body,
                  fontWeight: "700"
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type BottomTabsProps = {
  theme: AppTheme;
  isTeacher: boolean;
  activeScreen: "catalog" | "teacher" | "profile";
  onChange: (screen: "catalog" | "teacher" | "profile") => void;
};

function BottomTabs({
  theme,
  isTeacher,
  activeScreen,
  onChange
}: BottomTabsProps) {
  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        }
      ]}
    >
      {isTeacher ? (
        <TabButton
          theme={theme}
          label={String.fromCharCode(0x041F,0x0440,0x0435,0x043F,0x043E,0x0434,0x0430,0x0432,0x0430,0x0442,0x0435,0x043B,0x044C)}
          isActive={activeScreen === "teacher"}
          onPress={() => onChange("teacher")}
        />
      ) : (
        <TabButton
          theme={theme}
          label={String.fromCharCode(0x041A,0x0430,0x0442,0x0430,0x043B,0x043E,0x0433)}
          isActive={activeScreen === "catalog"}
          onPress={() => onChange("catalog")}
        />
      )}

      <TabButton
        theme={theme}
        label={String.fromCharCode(0x041F,0x0440,0x043E,0x0444,0x0438,0x043B,0x044C)}
        isActive={activeScreen === "profile"}
        onPress={() => onChange("profile")}
      />
    </View>
  );
}

type TabButtonProps = {
  theme: AppTheme;
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function TabButton({ theme, label, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface
        }
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive ? theme.colors.primary : theme.colors.textSecondary
          }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "700"
  }
});



