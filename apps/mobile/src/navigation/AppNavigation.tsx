import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { LectureDetails } from "@vm/shared";
import { createMockSession, evaluateSubmission, type SessionData, type TaskResult, type TaskSubmission } from "../mocks/session";
import { createTeacherManagedSession, moveTeacherSessionBlock, updateTeacherSessionStatus, type TeacherManagedSession } from "../mocks/teacher";
import { mockLectures, type LectureItem } from "../mocks/lectures";
import { mockUser, type UserProfile } from "../mocks/user";
import { CatalogScreen } from "../screens/CatalogScreen";
import { LectureDetailsScreen } from "../screens/LectureDetailsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SessionScreen } from "../screens/SessionScreen";
import { TaskResultScreen } from "../screens/TaskResultScreen";
import { TaskScreen } from "../screens/TaskScreen";
import { TeacherHomeScreen } from "../screens/TeacherHomeScreen";
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

        if (cachedLectures && cachedLectures.length > 0) {
          setCatalogLectures(cachedLectures);
          setCatalogMode("offline");
        } else {
          setCatalogLectures(mockLectures);
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

            setCatalogLectures(nextLectures);
            setCatalogMode("online");
            await writeCatalogSnapshot(nextLectures);
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

      setCatalogLectures(nextLectures);
      setCatalogMode("online");
      await writeCatalogSnapshot(nextLectures);
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

    try {
      await authApi.login(login.trim(), password.trim());

      const nextUser: UserProfile = {
        fullName:
          role === "teacher"
            ? "\u0422\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c"
            : "\u0422\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u0441\u0442\u0443\u0434\u0435\u043d\u0442",
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

      await refreshCatalogFromApi();
      return null;
    } catch (error) {
      return toUserMessage(error);
    }
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

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
    }

    await clearAuthSession();

    setIsAuthenticated(false);
    resetStudentFlow();
    resetTeacherFlow();
    setActiveScreen("catalog");
    setUser(mockUser);
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

    try {
      const details =
        lectureDetailsById[selectedLecture.id] ?? (await ensureLectureDetails(selectedLecture));

      if (!details) {
        throw new Error("Lecture details are unavailable");
      }

      const created = await sessionApi.createSession(selectedLecture.id);
      const sessionState = await sessionApi.getSession(created.sessionId);

      const mappedLecture = mapLectureDetailsToLectureItem(details, selectedLecture);
      const mappedSession = mapSessionToSessionData({
        lecture: mappedLecture,
        details,
        sessionState
      });

      setSelectedLecture(mappedLecture);
      setCurrentSession(mappedSession);
      setCurrentResult(null);
      setSessionMode("online");
      setActiveScreen("session");
    } catch {
      setCurrentSession(createMockSession(selectedLecture));
      setCurrentResult(null);
      setSessionMode("error");
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
    if (!currentSession || !selectedLecture) {
      return;
    }

    const details =
      lectureDetailsById[selectedLecture.id] ?? (await ensureLectureDetails(selectedLecture));

    if (!details) {
      const fallbackResult = evaluateSubmission(currentSession, submission);
      setCurrentResult(fallbackResult);
      setActiveScreen("result");
      return;
    }

    try {
      const quizBlockId =
        details.blocks.find((block) => block.type === "quiz")?.id ??
        details.blocks[0]?.id ??
        "";

      const apiAnswers = currentSession.questions.map((question) => {
        const answer =
          submission.answers.find((item) => item.questionId === question.id) ??
          { questionId: question.id };

        return {
          questionId: question.id,
          payload: mapTaskAnswerToApiPayload(question, answer)
        };
      });

      const response = await quizApi.submit({
        sessionId: currentSession.sessionId,
        blockId: quizBlockId,
        answers: apiAnswers
      });

      const result = mapQuizResponseToTaskResult({
        session: currentSession,
        submission,
        response
      });

      setCurrentResult(result);
      setSessionMode("online");
    } catch {
      const fallbackResult = evaluateSubmission(currentSession, submission);
      setCurrentResult(fallbackResult);
      setSessionMode("error");
    }

    setActiveScreen("result");
  }

  function handleBackToSession() {
    setActiveScreen("session");
  }

  async function handleOpenManageTeacherSession(lecture: LectureItem) {
    try {
      const details =
        lectureDetailsById[lecture.id] ?? (await ensureLectureDetails(lecture));

      if (!details) {
        throw new Error("Lecture details are unavailable");
      }

      const created = await sessionApi.createSession(lecture.id);
      const sessionState = await sessionApi.getSession(created.sessionId);

      const mappedLecture = mapLectureDetailsToLectureItem(details, lecture);
      const teacherSession = mapSessionToTeacherManagedSession({
        lecture: mappedLecture,
        sessionState
      });

      setCurrentTeacherSession(teacherSession);
      setActiveScreen("teacherSession");
    } catch {
      const fallbackSession = createTeacherManagedSession(lecture);
      setCurrentTeacherSession(fallbackSession);
      setActiveScreen("teacherSession");
    }
  }

  function handleBackToTeacherHome() {
    resetTeacherFlow();
    setActiveScreen("teacherHome");
  }

  function handleTeacherStartSession() {
    if (!currentTeacherSession) {
      return;
    }

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

  function handleBottomTabChange(screen: "catalog" | "teacher" | "profile") {
    if (screen === "profile") {
      setActiveScreen("profile");
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
            onOpenManageSession={(lecture) => void handleOpenManageTeacherSession(lecture)}
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
            onLogout={() => void handleLogout()}
          />
        ) : null}
      </View>

      <BottomTabs
        theme={theme}
        isTeacher={isTeacher}
        activeScreen={activeBottomTab}
        onChange={handleBottomTabChange}
      />
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