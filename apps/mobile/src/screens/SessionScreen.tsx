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
        title={lecture.title}
        subtitle="Активная сессия занятия"
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill
              theme={theme}
              label={session.connectionStatus === "online" ? "Online" : "Offline"}
              tone={session.connectionStatus === "online" ? "success" : "warning"}
            />
            <StatusPill
              theme={theme}
              label={session.status === "active" ? "Идёт занятие" : "Ожидание"}
              tone={session.status === "active" ? "info" : "neutral"}
            />
          </View>
        }
      />

      {isOffline ? <OfflineState theme={theme} onRetry={onRetry} /> : null}
      {hasError ? <ErrorState theme={theme} onRetry={onRetry} /> : null}

      <SectionCard
        theme={theme}
        title="О сессии"
        subtitle="Краткая сводка перед началом проверочного блока"
      >
        <Text style={styles.bodyText}>Код сессии: {session.sessionCode}</Text>
        <Text style={styles.bodyText}>Текущий блок: {session.currentBlockTitle}</Text>
        <Text style={styles.bodyText}>Участников в сессии: {session.participantsCount}</Text>
        <Text style={styles.bodyText}>Количество задач в блоке: {session.questions.length}</Text>
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Структура лекции"
        subtitle="Блоки, которые доступны в выбранной лекции"
      >
        {lecture.blocks.map((block, index) => (
          <Text key={`${block}-${index}`} style={styles.listItem}>
            {index + 1}. {block}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Что будет в задании"
        subtitle="Первые вопросы из проверочного блока"
      >
        {session.questions.slice(0, 3).map((question, index) => (
          <Text key={question.id} style={styles.listItem}>
            {index + 1}. {question.prompt}
          </Text>
        ))}

        {session.questions.length > 3 ? (
          <Text style={styles.bodyText}>
            И ещё {session.questions.length - 3} задач в этом блоке.
          </Text>
        ) : null}

        <View style={styles.actionTop}>
          <AppButton
            label={`Открыть блок из ${session.questions.length} задач`}
            onPress={onOpenTask}
            theme={theme}
          />
        </View>

        <View style={styles.actionTop}>
          <AppButton
            label="Назад к лекции"
            onPress={onBack}
            theme={theme}
            variant="secondary"
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
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
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
    }
  });
}