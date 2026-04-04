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
import type { Question, SessionData } from "../mocks/session";
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

  const previewQuestions = session.questions.slice(0, 3);

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
        title="Сводка по сессии"
        subtitle="Что сейчас происходит в лекции"
      >
        <Text style={styles.bodyText}>Код сессии: {session.sessionCode}</Text>
        <Text style={styles.bodyText}>Текущий блок: {session.currentBlockTitle}</Text>
        <Text style={styles.bodyText}>Участников: {session.participantsCount}</Text>
        <Text style={styles.bodyText}>Вопросов в проверочном блоке: {session.questions.length}</Text>
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Структура лекции"
        subtitle="Активные блоки лекции"
      >
        {lecture.blocks.map((block, index) => (
          <Text key={`${block}-${index}`} style={styles.listItem}>
            {index + 1}. {block}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Preview проверочного блока"
        subtitle="Первые вопросы перед запуском"
      >
        {previewQuestions.map((question, index) => (
          <View key={question.id} style={styles.previewCard}>
            <Text style={styles.previewIndex}>Вопрос {index + 1}</Text>
            <Text style={styles.previewPrompt}>{question.prompt}</Text>
            <Text style={styles.previewMeta}>{questionTypeLabel(question)}</Text>
          </View>
        ))}

        {session.questions.length > previewQuestions.length ? (
          <Text style={styles.bodyText}>
            И ещё {session.questions.length - previewQuestions.length} вопросов в этом блоке.
          </Text>
        ) : null}

        <View style={styles.actionTop}>
          <AppButton
            label={`Открыть блок из ${session.questions.length} вопросов`}
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

function questionTypeLabel(question: Question): string {
  if (question.type === "single-choice") {
    return "Один вариант ответа";
  }

  if (question.type === "multiple-choice") {
    return "Несколько вариантов ответа";
  }

  return "Короткий числовой ответ";
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
    },
    previewCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm
    },
    previewIndex: {
      fontSize: theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: "800",
      marginBottom: theme.spacing.xs
    },
    previewPrompt: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    previewMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    }
  });
}
