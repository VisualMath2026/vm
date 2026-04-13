import React, { useMemo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { UserProfile } from "../mocks/user";
import type { AppTheme, ThemeMode } from "../theme";
import { fixText } from "../utils/fixText";

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

  const displayName = useMemo(() => {
    const next = fixText(user.fullName || "").trim();

    if (/[А-Яа-яЁёA-Za-z]/.test(next)) {
      return next;
    }

    return user.role === "teacher" ? "Преподаватель VisualMath" : "Студент VisualMath";
  }, [user.fullName, user.role]);

  const initials = useMemo(() => {
    const parts = displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase() ?? "");

    return parts.join("") || "VM";
  }, [displayName]);

  const roleLabel = user.role === "teacher" ? "Преподаватель" : "Студент";

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Профиль и настройки"
        subtitle="Управляй своим аккаунтом, переключай режимы интерфейса и проверяй demo-состояния приложения."
        rightSlot={
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>{roleLabel}</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroSubtitle}>
              Личный кабинет пользователя платформы VisualMath.
            </Text>

            <View style={styles.heroBadges}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>{fixText(`Логин: ${user.login}`)}</Text>
              </View>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>{fixText(`Группа: ${user.group}`)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroStats}>
          <MiniStatCard
            theme={theme}
            value={themeMode === "dark" ? "Тёмная" : "Светлая"}
            label="Тема"
          />
          <MiniStatCard
            theme={theme}
            value={notificationsEnabled ? "Вкл" : "Выкл"}
            label="Уведомления"
          />
          <MiniStatCard
            theme={theme}
            value={catalogMode}
            label="Каталог"
          />
        </View>
      </View>

      <View style={styles.grid}>
        <SectionCard
          theme={theme}
          title="Данные аккаунта"
          subtitle="Основная информация по текущему профилю."
          style={styles.cardWide}
        >
          <View style={styles.infoGrid}>
            <InfoTile theme={theme} label="Имя" value={displayName} />
            <InfoTile theme={theme} label="Роль" value={roleLabel} />
            <InfoTile theme={theme} label="Логин" value={user.login} />
            <InfoTile theme={theme} label="Группа" value={user.group} />
          </View>
        </SectionCard>

        <SectionCard
          theme={theme}
          title="Быстрые статусы"
          subtitle="Состояние ключевых частей приложения."
          style={styles.cardNarrow}
        >
          <View style={styles.statusRow}>
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
        </SectionCard>
      </View>

      <View style={styles.grid}>
        <SectionCard
          theme={theme}
          title="Настройки интерфейса"
          subtitle="Минимальный набор пользовательских параметров."
          style={styles.cardWide}
        >
          <SettingRow
            theme={theme}
            title="Тёмная тема"
            description={`Сейчас активна ${themeMode === "dark" ? "тёмная" : "светлая"} тема.`}
            value={themeMode === "dark"}
            onValueChange={onToggleTheme}
          />

          <View style={styles.divider} />

          <SettingRow
            theme={theme}
            title="Уведомления"
            description={notificationsEnabled ? "Уведомления включены." : "Уведомления выключены."}
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
        </SectionCard>

        <SectionCard
          theme={theme}
          title="Demo-режимы"
          subtitle="Переключение состояний для быстрой проверки интерфейса."
          style={styles.cardNarrow}
        >
          <AppButton
            label="Сменить состояние каталога"
            onPress={onCycleCatalogMode}
            theme={theme}
            variant="secondary"
            style={styles.actionButton}
          />

          <AppButton
            label="Сменить состояние сессии"
            onPress={onCycleSessionMode}
            theme={theme}
            variant="secondary"
            style={styles.actionButton}
          />
        </SectionCard>
      </View>

      <SectionCard
        theme={theme}
        title="Сессия пользователя"
        subtitle="Локальное управление входом в аккаунт."
      >
        <View style={styles.logoutWrap}>
          <AppButton
            label="Выйти из аккаунта"
            onPress={onLogout}
            theme={theme}
            variant="secondary"
            fullWidth={false}
            style={styles.logoutButton}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

type MiniStatCardProps = {
  theme: AppTheme;
  value: string;
  label: string;
};

function MiniStatCard({ theme, value, label }: MiniStatCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.miniStatCard}>
      <Text style={styles.miniStatValue}>{fixText(value)}</Text>
      <Text style={styles.miniStatLabel}>{fixText(label)}</Text>
    </View>
  );
}

type InfoTileProps = {
  theme: AppTheme;
  label: string;
  value: string;
};

function InfoTile({ theme, label, value }: InfoTileProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>{fixText(label)}</Text>
      <Text style={styles.infoTileValue}>{fixText(value)}</Text>
    </View>
  );
}

type SettingRowProps = {
  theme: AppTheme;
  title: string;
  description: string;
  value: boolean;
  onValueChange: () => void;
};

function SettingRow({
  theme,
  title,
  description,
  value,
  onValueChange
}: SettingRowProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextBlock}>
        <Text style={styles.settingTitle}>{fixText(title)}</Text>
        <Text style={styles.settingDescription}>{fixText(description)}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary
        }}
      />
    </View>
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
    roleChip: {
      minHeight: 42,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    roleChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    heroCard: {
      flexDirection: "row",
      flexWrap: "wrap",
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.lg
    },
    heroLeft: {
      flex: 1,
      minWidth: 320,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: theme.spacing.lg
    },
    avatar: {
      width: 104,
      height: 104,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginRight: theme.spacing.lg,
      ...theme.shadow.md
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "900",
      color: "#FFFFFF"
    },
    heroTextBlock: {
      flex: 1
    },
    heroName: {
      fontSize: theme.typography.title,
      lineHeight: theme.typography.title + 6,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    heroSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    infoBadge: {
      minHeight: 34,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    infoBadgeText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    heroStats: {
      width: 260,
      minWidth: 220,
      justifyContent: "space-between"
    },
    miniStatCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    miniStatValue: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    miniStatLabel: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    cardWide: {
      flexBasis: 720,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    cardNarrow: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    infoTile: {
      flexBasis: 220,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    infoTileLabel: {
      fontSize: theme.typography.helper,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    infoTileValue: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    statusRow: {
      flexDirection: "row",
      flexWrap: "wrap"
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
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    settingDescription: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.lg
    },
    actionButton: {
      marginBottom: theme.spacing.sm
    },
    logoutWrap: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    logoutButton: {
      marginTop: theme.spacing.xs
    }
  });
}
