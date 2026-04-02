import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
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
      <ScreenHeader
        theme={theme}
        title="Результат задания"
        subtitle={
          result.status === "timeout"
            ? "Ответ отправлен по таймеру"
            : "Ответ успешно отправлен"
        }
      />

      <View style={styles.metaRow}>
        <StatusPill
          theme={theme}
          label={result.isCorrect ? "Ответ верный" : "Ответ неверный"}
          tone={result.isCorrect ? "success" : "danger"}
        />
        <StatusPill
          theme={theme}
          label={`Баллы: ${result.earnedPoints}/${result.maxPoints}`}
          tone="info"
        />
        <StatusPill
          theme={theme}
          label={`Время: ${result.timeSpentSec} сек.`}
          tone="neutral"
        />
      </View>

      <SectionCard
        title="Ответ"
        subtitle="Сводка по результату"
        theme={theme}
      >
        <Text style={styles.bodyText}>Твой ответ: {result.submittedAnswerLabel}</Text>
        <Text style={styles.bodyText}>Правильный ответ: {result.correctAnswerLabel}</Text>
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
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    },
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    actionGroup: {
      marginTop: theme.spacing.md
    }
  });
}