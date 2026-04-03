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
        title="Результаты блока"
        subtitle="Сводка по всем задачам лекции"
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill
              theme={theme}
              label={result.status === "timeout" ? "Время вышло" : "Отправлено"}
              tone={result.status === "timeout" ? "warning" : "success"}
            />
            <StatusPill
              theme={theme}
              label={`${result.correctCount}/${result.totalQuestions} верно`}
              tone="info"
            />
          </View>
        }
      />

      <SectionCard
        theme={theme}
        title="Итог"
        subtitle="Общая оценка по проверочному блоку"
      >
        <Text style={styles.bodyText}>Верных ответов: {result.correctCount} из {result.totalQuestions}</Text>
        <Text style={styles.bodyText}>Баллы: {result.earnedPoints} / {result.maxPoints}</Text>
        <Text style={styles.bodyText}>Время на выполнение: {result.timeSpentSec} сек.</Text>
      </SectionCard>

      {result.answers.map((answer, index) => (
        <SectionCard
          key={answer.questionId}
          theme={theme}
          title={`Задача ${index + 1}`}
          subtitle={answer.isCorrect ? "Ответ верный" : "Ответ неверный"}
        >
          <Text style={styles.bodyText}>{answer.prompt}</Text>
          <Text style={styles.bodyText}>Твой ответ: {answer.submittedAnswerLabel}</Text>
          <Text style={styles.bodyText}>Правильный ответ: {answer.correctAnswerLabel}</Text>
          <Text style={styles.bodyText}>{answer.explanation}</Text>
        </SectionCard>
      ))}

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
          label="Завершить и вернуться в каталог"
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