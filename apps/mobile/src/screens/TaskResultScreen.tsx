import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { TaskResult } from "../mocks/session";
import type { AppTheme } from "../theme";

type TaskResultScreenProps = {
  theme: AppTheme;
  result: TaskResult;
  onBackToSession: () => void;
  onFinish: () => void;
};

export function TaskResultScreen({
  theme,
  result,
  onBackToSession,
  onFinish
}: TaskResultScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Результат задания</Text>
      <Text style={styles.subtitle}>
        {result.status === "timeout" ? "Ответ отправлен по таймеру" : "Ответ успешно отправлен"}
      </Text>

      <SectionCard
        title={result.isCorrect ? "Ответ верный" : "Ответ неверный"}
        subtitle={`Баллы: ${result.earnedPoints} / ${result.maxPoints}`}
        theme={theme}
      >
        <Text style={styles.metaText}>Твой ответ: {result.submittedAnswerLabel}</Text>
        <Text style={styles.metaText}>Правильный ответ: {result.correctAnswerLabel}</Text>
        <Text style={styles.metaText}>Время: {result.timeSpentSec} сек.</Text>
      </SectionCard>

      <SectionCard
        title="Пояснение"
        subtitle="Локальная проверка результата"
        theme={theme}
      >
        <Text style={styles.bodyText}>{result.explanation}</Text>
      </SectionCard>

      <View style={styles.actionGroup}>
        <AppButton
          label="Назад к сессии"
          onPress={onBackToSession}
          theme={theme}
          variant="secondary"
        />
      </View>

      <View style={styles.actionGroup}>
        <AppButton
          label="Завершить и вернуться к лекции"
          onPress={onFinish}
          theme={theme}
        />
      </View>
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
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text
    },
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    actionGroup: {
      marginTop: theme.spacing.md
    }
  });
}