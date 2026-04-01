import React from "react";

import { StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { UserProfile } from "../mocks/user";
import type { AppTheme, ThemeMode } from "../theme";

type ProfileScreenProps = {
  theme: AppTheme;
  user: UserProfile;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  onToggleTheme: () => void;
  onToggleNotifications: () => void;
  onLogout: () => void;
};

export function ProfileScreen({
  theme,
  user,
  themeMode,
  notificationsEnabled,
  onToggleTheme,
  onToggleNotifications,
  onLogout
}: ProfileScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Профиль</Text>
      <Text style={styles.subtitle}>
        Пользовательские данные и базовые настройки приложения.
      </Text>

      <SectionCard
        title={user.fullName}
        subtitle="Учебный профиль"
        theme={theme}
      >
        <Text style={styles.metaText}>Логин: {user.login}</Text>
        <Text style={styles.metaText}>Роль: {user.role}</Text>
        <Text style={styles.metaText}>Группа: {user.group}</Text>
      </SectionCard>

      <SectionCard
        title="Настройки"
        subtitle="Минимальный набор для VM Mobile"
        theme={theme}
      >
        <View style={styles.settingRow}>
          <View style={styles.settingTextBlock}>
            <Text style={styles.settingTitle}>Тёмная тема</Text>
            <Text style={styles.settingDescription}>
              Сейчас активна: {themeMode === "dark" ? "тёмная" : "светлая"}
            </Text>
          </View>
          <Switch value={themeMode === "dark"} onValueChange={onToggleTheme} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextBlock}>
            <Text style={styles.settingTitle}>Уведомления</Text>
            <Text style={styles.settingDescription}>
              {notificationsEnabled ? "Включены" : "Выключены"}
            </Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />
        </View>
      </SectionCard>

      <SectionCard
        title="Сессия"
        subtitle="Локальное управление пользователем"
        theme={theme}
      >
        <AppButton
          label="Выйти из аккаунта"
          onPress={onLogout}
          theme={theme}
          variant="secondary"
        />
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      fontSize: theme.typography.screenTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    settingTextBlock: {
      flex: 1,
      paddingRight: theme.spacing.md
    },
    settingTitle: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    settingDescription: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md
    }
  });
}
