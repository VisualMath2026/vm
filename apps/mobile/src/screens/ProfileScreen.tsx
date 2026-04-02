import React from "react";

import { StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { UserProfile } from "../mocks/user";
import type { AppTheme, ThemeMode } from "../theme";

type DemoDataMode = "online" | "offline" | "loading" | "error";

type ProfileScreenProps = {
  theme: AppTheme;
  user: UserProfile;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  catalogMode: DemoDataMode;
  sessionMode: DemoDataMode;
  onToggleTheme: () => void;
  onToggleNotifications: () => void;
  onCycleCatalogMode: () => void;
  onCycleSessionMode: () => void;
  onLogout: () => void;
};

export function ProfileScreen({
  theme,
  user,
  themeMode,
  notificationsEnabled,
  catalogMode,
  sessionMode,
  onToggleTheme,
  onToggleNotifications,
  onCycleCatalogMode,
  onCycleSessionMode,
  onLogout
}: ProfileScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Профиль"
        subtitle="Пользовательские данные, настройки и demo-состояния."
      />

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
        title="Demo-состояния"
        subtitle="Быстрое переключение loading / error / offline"
        theme={theme}
      >
        <View style={styles.pillRow}>
          <StatusPill
            theme={theme}
            label={`Каталог: ${catalogMode}`}
            tone={mapModeToTone(catalogMode)}
          />
          <StatusPill
            theme={theme}
            label={`Сессия: ${sessionMode}`}
            tone={mapModeToTone(sessionMode)}
          />
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label="Сменить состояние каталога"
            onPress={onCycleCatalogMode}
            theme={theme}
            variant="secondary"
          />
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label="Сменить состояние сессии"
            onPress={onCycleSessionMode}
            theme={theme}
            variant="secondary"
          />
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

function mapModeToTone(mode: DemoDataMode) {
  if (mode === "online") {
    return "success";
  }

  if (mode === "offline") {
    return "warning";
  }

  if (mode === "loading") {
    return "info";
  }

  return "danger";
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
    },
    actionGroup: {
      marginTop: theme.spacing.md
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    }
  });
}