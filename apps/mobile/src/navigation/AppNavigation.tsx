import React, { useEffect, useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { LoadingState } from "../components/ui/LoadingState";
import { mockLectures, type LectureItem } from "../mocks/lectures";
import {
  createMockSession,
  evaluateSubmission,
  type SessionData,
  type TaskResult,
  type TaskSubmission
} from "../mocks/session";
import {
  createTeacherManagedSession,
  moveTeacherSessionBlock,
  updateTeacherSessionStatus,
  type TeacherManagedSession
} from "../mocks/teacher";
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
  readAuthSession,
  writeAuthSession
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

export function AppNavigation() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("catalog");
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [catalogLectures, setCatalogLectures] = useState<LectureItem[]>(mockLectures);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);
  const [lastOpenedLectureId, setLastOpenedLectureId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);
  const [currentTeacherSession, setCurrentTeacherSession] =
    useState<TeacherManagedSession | null>(null);
  const [catalogMode, setCatalogMode] = useState<DemoDataMode>("offline");
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
          storedAuthSession
        ] = await Promise.all([
          readCatalogSnapshot(),
          readLastLectureId(),
          readThemeMode(),
          readNotificationsEnabled(),
          readAuthSession()
        ]);

        if (!isMounted) {
          return;
        }

        if (cachedLectures && cachedLectures.length > 0) {
          setCatalogLectures(cachedLectures);
        } else {
          setCatalogLectures(mockLectures);
          await writeCatalogSnapshot(mockLectures);
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

        if (storedAuthSession) {
          setUser({
            ...mockUser,
            fullName:
              storedAuthSession.role === "teacher"
                ? "Демо преподаватель"
                : mockUser.fullName,
            login: storedAuthSession.userLogin,
            role: storedAuthSession.role
          });
          setIsAuthenticated(true);
          setActiveScreen(
            storedAuthSession.role === "teacher"
              ? "teacherHome"
              : "catalog"
          );
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

  function createMockAccessToken(login: string) {
    return `vm-token-${login.trim().toLowerCase()}-${Date.now()}`;
  }

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

  function handleLogin(
    login: string,
    password: string,
    role: LoginRole
  ) {
    if (!login.trim() || !password.trim()) {
      return "Введите логин и пароль.";
    }

    const normalizedLogin = login.trim();

    setUser({
      ...mockUser,
      fullName: role === "teacher" ? "Демо преподаватель" : mockUser.fullName,
      login: normalizedLogin,
      role
    });
    setIsAuthenticated(true);
    setActiveScreen(role === "teacher" ? "teacherHome" : "catalog");

    void writeAuthSession({
      accessToken: createMockAccessToken(normalizedLogin),
      userLogin: normalizedLogin,
      role,
      issuedAt: new Date().toISOString()
    });

    return null;
  }

  function resetStudentFlow() {
    setSelectedLecture(null);
    setCurrentSession(null);
    setCurrentResult(null);
  }

  function resetTeacherFlow() {
    setCurrentTeacherSession(null);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    resetStudentFlow();
    resetTeacherFlow();
    setActiveScreen("catalog");
    void clearAuthSession();
  }

  function handleOpenLecture(lecture: LectureItem) {
    setSelectedLecture(lecture);
    setLastOpenedLectureId(lecture.id);
    void writeLastLectureId(lecture.id);
    setCurrentSession(null);
    setCurrentResult(null);
    setActiveScreen("details");
  }

  function handleBackToCatalog() {
    resetStudentFlow();
    setActiveScreen("catalog");
  }

  function handleOpenSession() {
    if (!selectedLecture) {
      return;
    }

    const session = createMockSession(selectedLecture);
    setCurrentSession(session);
    setCurrentResult(null);
    setActiveScreen("session");
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

  function handleSubmitTask(submission: TaskSubmission) {
    if (!currentSession) {
      return;
    }

    const result = evaluateSubmission(currentSession, submission);
    setCurrentResult(result);
    setActiveScreen("result");
  }

  function handleBackToSession() {
    setActiveScreen("session");
  }

  function handleOpenManageTeacherSession(lecture: LectureItem) {
    const teacherSession = createTeacherManagedSession(lecture);
    setCurrentTeacherSession(teacherSession);
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

    setCurrentTeacherSession(
      updateTeacherSessionStatus(currentTeacherSession, "active")
    );
  }

  function handleTeacherStopSession() {
    if (!currentTeacherSession) {
      return;
    }

    setCurrentTeacherSession(
      updateTeacherSessionStatus(currentTeacherSession, "stopped")
    );
  }

  function handleTeacherPrevBlock() {
    if (!currentTeacherSession) {
      return;
    }

    setCurrentTeacherSession(
      moveTeacherSessionBlock(currentTeacherSession, "prev")
    );
  }

  function handleTeacherNextBlock() {
    if (!currentTeacherSession) {
      return;
    }

    setCurrentTeacherSession(
      moveTeacherSessionBlock(currentTeacherSession, "next")
    );
  }

  if (isHydrating) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centeredState}>
          <LoadingState theme={theme} text="Восстанавливаем локальные данные..." />
        </View>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {!isTeacher && activeScreen === "catalog" ? (
          <CatalogScreen
            theme={theme}
            lectures={catalogLectures}
            lastOpenedLecture={lastOpenedLecture}
            isLoading={catalogMode === "loading"}
            hasError={catalogMode === "error"}
            isOffline={catalogMode === "offline"}
            onRetry={() => setCatalogMode("online")}
            onOpenLecture={handleOpenLecture}
          />
        ) : null}

        {!isTeacher && activeScreen === "details" && selectedLecture ? (
          <LectureDetailsScreen
            theme={theme}
            lecture={selectedLecture}
            onBack={handleBackToCatalog}
            onOpenSession={handleOpenSession}
          />
        ) : null}

        {!isTeacher && activeScreen === "session" && selectedLecture && currentSession ? (
          <SessionScreen
            theme={theme}
            lecture={selectedLecture}
            session={currentSession}
            isOffline={sessionMode === "offline"}
            hasError={sessionMode === "error"}
            onRetry={() => setSessionMode("online")}
            onBack={handleBackToLecture}
            onOpenTask={handleOpenTask}
          />
        ) : null}

        {!isTeacher && activeScreen === "task" && currentSession ? (
          <TaskScreen
            theme={theme}
            session={currentSession}
            onBack={handleBackToSession}
            onSubmit={handleSubmitTask}
          />
        ) : null}

        {!isTeacher && activeScreen === "result" && currentResult ? (
          <TaskResultScreen
            theme={theme}
            result={currentResult}
            onBackToSession={handleBackToSession}
            onFinish={handleBackToLecture}
          />
        ) : null}

        {isTeacher && activeScreen === "teacherHome" ? (
          <TeacherHomeScreen
            theme={theme}
            user={user}
            lectures={catalogLectures}
            onOpenManageSession={handleOpenManageTeacherSession}
          />
        ) : null}

        {isTeacher && activeScreen === "teacherSession" && currentTeacherSession ? (
          <TeacherSessionControlScreen
            theme={theme}
            session={currentTeacherSession}
            onBack={handleBackToTeacherHome}
            onStart={handleTeacherStartSession}
            onStop={handleTeacherStopSession}
            onPrevBlock={handleTeacherPrevBlock}
            onNextBlock={handleTeacherNextBlock}
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
            onLogout={handleLogout}
          />
        ) : null}
      </View>

      <BottomTabs
        theme={theme}
        isTeacher={isTeacher}
        activeScreen={activeBottomTab}
        onChange={(screen) => {
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
        }}
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
          label="Преподаватель"
          isActive={activeScreen === "teacher"}
          onPress={() => onChange("teacher")}
        />
      ) : (
        <TabButton
          theme={theme}
          label="Каталог"
          isActive={activeScreen === "catalog"}
          onPress={() => onChange("catalog")}
        />
      )}

      <TabButton
        theme={theme}
        label="Профиль"
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

function TabButton({
  theme,
  label,
  isActive,
  onPress
}: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive
            ? theme.colors.surfaceMuted
            : "transparent"
        }
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive
              ? theme.colors.primary
              : theme.colors.textSecondary
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
    justifyContent: "center"
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