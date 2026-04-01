import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { mockLectures, type LectureItem } from "../mocks/lectures";
import { mockUser, type UserProfile } from "../mocks/user";
import { CatalogScreen } from "../screens/CatalogScreen";
import { LectureDetailsScreen } from "../screens/LectureDetailsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { createAppTheme, type AppTheme, type ThemeMode } from "../theme";

type ScreenKey = "catalog" | "details" | "profile";

export function AppNavigation() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("catalog");
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);

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

  function handleLogout() {
    setIsAuthenticated(false);
    setSelectedLecture(null);
    setActiveScreen("catalog");
  }

  function handleOpenLecture(lecture: LectureItem) {
    setSelectedLecture(lecture);
    setActiveScreen("details");
  }

  function handleBackToCatalog() {
    setActiveScreen("catalog");
  }

  if (!isAuthenticated) {
    return <LoginScreen theme={theme} onLogin={handleLogin} />;
  }

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
        activeScreen={activeScreen === "details" ? "catalog" : activeScreen}
        onChange={(screen) => {
          setActiveScreen(screen);
          setSelectedLecture(null);
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