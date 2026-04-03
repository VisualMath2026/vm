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

type DraftAnswer = {
  selectedOptionId?: string;
  shortAnswer?: string;
};

export function TaskScreen({ theme, session, onBack, onSubmit }: TaskScreenProps) {
  const styles = createStyles(theme);
  const initialTime = session.questions[0]?.timeLimitSec ?? 60;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, DraftAnswer>>({});
  const [errorText, setErrorText] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const currentQuestion = session.questions[currentIndex];
  const currentDraft = answersByQuestionId[currentQuestion.id] ?? {};

  useEffect(() => {
    if (isLocked) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((current: number) => {
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

  function hasAnswer(index: number): boolean {
    const question = session.questions[index];
    const answer = answersByQuestionId[question.id];

    if (!answer) {
      return false;
    }

    if (question.type === "single-choice") {
      return Boolean(answer.selectedOptionId);
    }

    return Boolean(answer.shortAnswer?.trim());
  }

  function buildSubmission(status: "submitted" | "timeout"): TaskSubmission {
    return {
      answers: session.questions.map((question) => {
        const answer = answersByQuestionId[question.id] ?? {};

        return {
          questionId: question.id,
          selectedOptionId: answer.selectedOptionId,
          shortAnswer: answer.shortAnswer
        };
      }),
      timeSpentSec: initialTime - timeLeft,
      status
    };
  }

  function handleSelectOption(optionId: string) {
    setAnswersByQuestionId((current) => ({
      ...current,
      [currentQuestion.id]: {
        ...current[currentQuestion.id],
        selectedOptionId: optionId
      }
    }));
    setErrorText("");
  }

  function handleShortAnswer(value: string) {
    setAnswersByQuestionId((current) => ({
      ...current,
      [currentQuestion.id]: {
        ...current[currentQuestion.id],
        shortAnswer: value
      }
    }));
    setErrorText("");
  }

  function handleSubmit(status: "submitted" | "timeout") {
    if (isLocked) {
      return;
    }

    if (status === "submitted") {
      const unansweredIndex = session.questions.findIndex((_, index) => !hasAnswer(index));

      if (unansweredIndex !== -1) {
        setCurrentIndex(unansweredIndex);
        setErrorText(`Заполни вопрос ${unansweredIndex + 1} из ${session.questions.length}.`);
        return;
      }
    }

    setErrorText("");
    setIsLocked(true);
    onSubmit(buildSubmission(status));
  }

  const answeredCount = session.questions.filter((_, index) => hasAnswer(index)).length;

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Проверочный блок"
        subtitle={session.lectureTitle}
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill
              theme={theme}
              label={`Вопрос ${currentIndex + 1} из ${session.questions.length}`}
              tone="info"
            />
            <StatusPill
              theme={theme}
              label={`Готово: ${answeredCount}/${session.questions.length}`}
              tone="success"
            />
          </View>
        }
      />

      <SectionCard
        theme={theme}
        title="Таймер"
        subtitle="Если время закончится, ответы отправятся автоматически"
      >
        <Text style={styles.timer}>{timerLabel}</Text>
        <Text style={styles.metaText}>Проверь все ответы перед финальной отправкой.</Text>
      </SectionCard>

      <SectionCard
        theme={theme}
        title={`Задача ${currentIndex + 1}`}
        subtitle="Последовательно ответь на все вопросы блока"
      >
        <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

        {currentQuestion.type === "single-choice"
          ? currentQuestion.options?.map((option) => {
              const isSelected = option.id === currentDraft.selectedOptionId;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectOption(option.id)}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.surfaceMuted : theme.colors.surface
                    }
                  ]}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              );
            })
          : null}

        {currentQuestion.type === "short-answer" ? (
          <AppInput
            label="Твой ответ"
            value={currentDraft.shortAnswer ?? ""}
            onChangeText={handleShortAnswer}
            placeholder="Введите ответ"
            theme={theme}
          />
        ) : null}

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Навигация"
        subtitle="Можно возвращаться к предыдущим задачам и менять ответы"
      >
        <View style={styles.navRow}>
          <Pressable
            onPress={() => setCurrentIndex((current) => Math.max(0, current - 1))}
            disabled={currentIndex === 0}
            style={[
              styles.navButton,
              {
                opacity: currentIndex === 0 ? 0.5 : 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface
              }
            ]}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Назад</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setCurrentIndex((current) =>
                Math.min(session.questions.length - 1, current + 1)
              )
            }
            disabled={currentIndex === session.questions.length - 1}
            style={[
              styles.navButton,
              {
                opacity: currentIndex === session.questions.length - 1 ? 0.5 : 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface
              }
            ]}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Далее</Text>
          </Pressable>
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label="Отправить все ответы"
            onPress={() => handleSubmit("submitted")}
            theme={theme}
            disabled={isLocked}
          />
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label="Вернуться к сессии"
            onPress={onBack}
            theme={theme}
            variant="secondary"
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
    },
    navRow: {
      flexDirection: "row",
      gap: theme.spacing.sm
    },
    navButton: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md
    },
    navButtonText: {
      fontSize: theme.typography.body,
      fontWeight: "700"
    }
  });
}