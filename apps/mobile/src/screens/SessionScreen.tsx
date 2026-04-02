import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { ErrorState } from "../components/ui/ErrorState";
import { OfflineState } from "../components/ui/OfflineState";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { LectureItem } from "../mocks/lectures";
import type { SessionData } from "../mocks/session";
import type { AppTheme } from "../theme";

type SessionScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  session: SessionData;
  isOffline?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onBack: () => void;
  onOpenTask: () => void;
};

export function SessionScreen({
  theme,
  lecture,
  session,
  isOffline = false,
  hasError = false,
  onRetry,
  onBack,
  onOpenTask
}: SessionScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Сессия занятия"
        subtitle={lecture.title}
        rightSlot={
          <AppButton
            label="Назад к лекции"
            onPress={onBack}
            theme={theme}
            variant="secondary"
          />
        }
      />

      <View style={styles.metaRow}>
        <StatusPill
          theme={theme}
          label={`Статус: ${session.status}`}
          tone={session.status === "active" ? "success" : "warning"}
        />
        <StatusPill
          theme={theme}
          label={`Подключение: ${isOffline ? "offline" : session.connectionStatus}`}
          tone={isOffline ? "warning" : "info"}
        />
        <StatusPill
          theme={theme}
          label={`Участников: ${session.participantsCount}`}
          tone="neutral"
        />
      </View>

      {isOffline ? (
        <View style={styles.stateBlock}>
          <OfflineState
            theme={theme}
            description="Сессия открыта в демо-режиме без сети. Доступен последний локальный снимок данных."
            onRetry={onRetry}
          />
        </View>
      ) : null}

      {hasError ? (
        <View style={styles.stateBlock}>
          <ErrorState
            theme={theme}
            title="Ошибка загрузки состояния сессии"
            description="Можно вернуться в лекцию или попробовать повторить получение данных."
            onRetry={onRetry}
          />
        </View>
      ) : null}

      <SectionCard
        title="Текущий блок"
        subtitle={`Код подключения: ${session.sessionCode}`}
        theme={theme}
      >
        <Text style={styles.bodyText}>{session.currentBlockTitle}</Text>
      </SectionCard>

      <SectionCard
        title="Состав лекции"
        subtitle="Блоки текущего занятия"
        theme={theme}
      >
        {lecture.blocks.map((block, index) => (
          <Text key={block} style={styles.listItem}>
            {index + 1}. {block}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        title="Проверочный блок"
        subtitle="Локальный сценарий без сервера"
        theme={theme}
      >
        <Text style={styles.bodyText}>{session.question.prompt}</Text>

        <View style={styles.actionTop}>
          <AppButton
            label="Открыть задание"
            onPress={onOpenTask}
            theme={theme}
            disabled={hasError}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text
    },
    listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    actionTop: {
      marginTop: theme.spacing.md
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    },
    stateBlock: {
      marginBottom: theme.spacing.md
    }
  });
}