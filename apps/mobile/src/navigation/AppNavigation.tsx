import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { mockLectures, type LectureItem } from "../mocks/lectures";
import {
  createMockSession,
  evaluateSubmission,
  type SessionData,
  type TaskResult,
  type TaskSubmission
} from "../mocks/session";
import { mockUser, type UserProfile } from "../mocks/user";
import { CatalogScreen } from "../screens/CatalogScreen";
import { LectureDetailsScreen } from "../screens/LectureDetailsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SessionScreen } from "../screens/SessionScreen";
import { TaskResultScreen } from "../screens/TaskResultScreen";
import { TaskScreen } from "../screens/TaskScreen";
import { createAppTheme, type AppTheme, type ThemeMode } from "../theme";

type ScreenKey = "catalog" | "details" | "session" | "task" | "result" | "profile";

export function AppNavigation() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("catalog");
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  function handleLogin(login: string, password: string) {
    if (!login.trim() || !password.trim()) {
      return "Введите логин и пароль.";
    }

    setUser({
      ...mockUser,
      login: login.trim()
    });
    setIsAuthenticated(true);
    setActiveScreen("catalog");
    return null;
  }

  function resetFlow() {
    setSelectedLecture(null);
    setCurrentSession(null);
    setCurrentResult(null);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    resetFlow();
    setActiveScreen("catalog");
  }

  function handleOpenLecture(lecture: LectureItem) {
    setSelectedLecture(lecture);
    setCurrentSession(null);
    setCurrentResult(null);
    setActiveScreen("details");
  }

  function handleBackToCatalog() {
    resetFlow();
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

  if (!isAuthenticated) {
    return <LoginScreen theme={theme} onLogin={handleLogin} />;
  }

  const bottomTabScreen: "catalog" | "profile" =
    activeScreen === "profile" ? "profile" : "catalog";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {activeScreen === "catalog" ? (
          <CatalogScreen
            theme={theme}
            lectures={mockLectures}
            isOffline
            onRetry={() => undefined}
            onOpenLecture={handleOpenLecture}
          />
        ) : null}

        {activeScreen === "details" && selectedLecture ? (
          <LectureDetailsScreen
            theme={theme}
            lecture={selectedLecture}
            onBack={handleBackToCatalog}
            onOpenSession={handleOpenSession}
          />
        ) : null}

        {activeScreen === "session" && selectedLecture && currentSession ? (
          <SessionScreen
            theme={theme}
            lecture={selectedLecture}
            session={currentSession}
            onBack={handleBackToLecture}
            onOpenTask={handleOpenTask}
          />
        ) : null}

        {activeScreen === "task" && currentSession ? (
          <TaskScreen
            theme={theme}
            session={currentSession}
            onBack={handleBackToSession}
            onSubmit={handleSubmitTask}
          />
        ) : null}

        {activeScreen === "result" && currentResult ? (
          <TaskResultScreen
            theme={theme}
            result={currentResult}
            onBackToSession={handleBackToSession}
            onFinish={handleBackToLecture}
          />
        ) : null}

        {activeScreen === "profile" ? (
          <ProfileScreen
            theme={theme}
            user={user}
            themeMode={themeMode}
            notificationsEnabled={notificationsEnabled}
            onToggleTheme={() =>
              setThemeMode((currentMode) =>
                currentMode === "light" ? "dark" : "light"
              )
            }
            onToggleNotifications={() =>
              setNotificationsEnabled((currentValue) => !currentValue)
            }
            onLogout={handleLogout}
          />
        ) : null}
      </View>

      <BottomTabs
        theme={theme}
        activeScreen={bottomTabScreen}
        onChange={(screen) => {
          if (screen === "catalog") {
            handleBackToCatalog();
            return;
          }

          setActiveScreen("profile");
        }}
      />
    </View>
  );
}

type BottomTabsProps = {
  theme: AppTheme;
  activeScreen: "catalog" | "profile";
  onChange: (screen: "catalog" | "profile") => void;
};

function BottomTabs({
  theme,
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
      <TabButton
        theme={theme}
        label="Каталог"
        isActive={activeScreen === "catalog"}
        onPress={() => onChange("catalog")}
      />
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