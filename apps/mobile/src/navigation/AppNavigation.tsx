import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { mockLectures } from "../mocks/lectures";
import { mockUser, type UserProfile } from "../mocks/user";
import { CatalogScreen } from "../screens/CatalogScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { createAppTheme, type AppTheme, type ThemeMode } from "../theme";

type ScreenKey = "catalog" | "profile";

export function AppNavigation() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("catalog");
  const [user, setUser] = useState<UserProfile>(mockUser);

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
            onRetry={() => undefined}
          />
        ) : (
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
        )}
      </View>

      <BottomTabs
        theme={theme}
        activeScreen={activeScreen}
        onChange={setActiveScreen}
      />
    </View>
  );
}

type BottomTabsProps = {
  theme: AppTheme;
  activeScreen: ScreenKey;
  onChange: (screen: ScreenKey) => void;
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
