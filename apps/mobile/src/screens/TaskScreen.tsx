import React, { useEffect, useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { SessionData, TaskSubmission } from "../mocks/session";
import type { AppTheme } from "../theme";

type TaskScreenProps = {
  theme: AppTheme;
  session: SessionData;
  onBack: () => void;
  onSubmit: (submission: TaskSubmission) => void;
};

export function TaskScreen({
  theme,
  session,
  onBack,
  onSubmit
}: TaskScreenProps) {
  const styles = createStyles(theme);
  const [timeLeft, setTimeLeft] = useState(session.question.timeLimitSec);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [shortAnswer, setShortAnswer] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (isLocked) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timerId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLocked]);

  useEffect(() => {
    if (timeLeft === 0 && !isLocked) {
      handleSubmit("timeout");
    }
  }, [timeLeft, isLocked]);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  function handleSubmit(status: "submitted" | "timeout") {
    if (isLocked) {
      return;
    }

    if (status === "submitted") {
      if (session.question.type === "single-choice" && !selectedOptionId) {
        setErrorText("Выбери один вариант ответа.");
        return;
      }

      if (session.question.type === "short-answer" && !shortAnswer.trim()) {
        setErrorText("Введи ответ перед отправкой.");
        return;
      }
    }

    setErrorText("");
    setIsLocked(true);

    const timeSpentSec = session.question.timeLimitSec - timeLeft;

    onSubmit({
      selectedOptionId,
      shortAnswer,
      timeSpentSec,
      status
    });
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Задание"
        subtitle="Проверочный блок текущей сессии"
        rightSlot={
          <AppButton
            label="Назад к сессии"
            onPress={onBack}
            theme={theme}
            variant="secondary"
          />
        }
      />

      <View style={styles.metaRow}>
        <StatusPill
          theme={theme}
          label={`Тип: ${session.question.type === "single-choice" ? "выбор" : "ответ"}`}
          tone="info"
        />
        <StatusPill
          theme={theme}
          label={`Баллы: ${session.question.points}`}
          tone="success"
        />
      </View>

      <SectionCard
        title="Таймер"
        subtitle={`Максимум: ${session.question.timeLimitSec} сек.`}
        theme={theme}
      >
        <Text style={styles.timer}>{timerLabel}</Text>
        <Text style={styles.metaText}>
          Если время закончится, ответ будет отправлен автоматически.
        </Text>
      </SectionCard>

      <SectionCard
        title="Вопрос"
        subtitle="Ответ фиксируется сразу после отправки"
        theme={theme}
      >
        <Text style={styles.questionText}>{session.question.prompt}</Text>

        {session.question.type === "single-choice"
          ? session.question.options?.map((option) => {
              const isSelected = option.id === selectedOptionId;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setSelectedOptionId(option.id);
                    setErrorText("");
                  }}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.surfaceMuted : theme.colors.surface
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.text
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })
          : null}

        {session.question.type === "short-answer" ? (
          <AppInput
            label="Твой ответ"
            value={shortAnswer}
            onChangeText={(value) => {
              setShortAnswer(value);
              setErrorText("");
            }}
            placeholder="Введите ответ"
            keyboardType="numeric"
            theme={theme}
          />
        ) : null}

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <View style={styles.actionGroup}>
          <AppButton
            label="Отправить ответ"
            onPress={() => handleSubmit("submitted")}
            theme={theme}
            disabled={isLocked}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    timer: {
      fontSize: theme.typography.title,
      fontWeight: "800",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm
    },
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center"
    },
    questionText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.md
    },
    optionButton: {
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm
    },
    optionText: {
      fontSize: theme.typography.body,
      fontWeight: "600"
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    actionGroup: {
      marginTop: theme.spacing.md
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    }
  });
}