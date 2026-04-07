import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { Question, SessionData, TaskSubmission } from "../mocks/session";
import type { AppTheme } from "../theme";

type TaskScreenProps = {
  theme: AppTheme;
  session: SessionData;
  onBack: () => void;
  onSubmit: (submission: TaskSubmission) => void;
};

type DraftAnswer = {
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  shortAnswer?: string;
};

export function TaskScreen({ theme, session, onBack, onSubmit }: TaskScreenProps) {
  const styles = createStyles(theme);

  const initialTime = useMemo(() => {
    return session.questions.reduce((max, question) => Math.max(max, question.timeLimitSec), 60);
  }, [session.questions]);

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, DraftAnswer>>({});
  const [errorText, setErrorText] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const currentQuestion = session.questions[currentIndex];

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

  if (!currentQuestion) {
    return (
      <Screen theme={theme}>
        <ScreenHeader theme={theme} title="Проверочный блок" subtitle="Нет доступных вопросов" />
        <SectionCard theme={theme} title="Пустой блок" subtitle="В этой сессии ещё нет заданий">
          <View style={styles.actionGroup}>
            <AppButton label="Назад" onPress={onBack} theme={theme} variant="secondary" />
          </View>
        </SectionCard>
      </Screen>
    );
  }

  const currentDraft = answersByQuestionId[currentQuestion.id] ?? {};

  function questionTypeLabel(question: Question): string {
    if (question.type === "single-choice") {
      return "Один вариант";
    }

    if (question.type === "multiple-choice") {
      return "Несколько вариантов";
    }

    return "Короткий ответ";
  }

  function hasAnswer(question: Question): boolean {
    const answer = answersByQuestionId[question.id];

    if (!answer) {
      return false;
    }

    if (question.type === "single-choice") {
      return Boolean(answer.selectedOptionId);
    }

    if (question.type === "multiple-choice") {
      return Boolean(answer.selectedOptionIds?.length);
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
          selectedOptionIds: answer.selectedOptionIds,
          shortAnswer: answer.shortAnswer
        };
      }),
      timeSpentSec: initialTime - timeLeft,
      status
    };
  }

  function handleSelectSingleOption(optionId: string) {
    setAnswersByQuestionId((current) => ({
      ...current,
      [currentQuestion.id]: {
        ...current[currentQuestion.id],
        selectedOptionId: optionId
      }
    }));
    setErrorText("");
  }

  function handleToggleMultipleOption(optionId: string) {
    setAnswersByQuestionId((current) => {
      const existing = current[currentQuestion.id]?.selectedOptionIds ?? [];
      const nextSelected = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];

      return {
        ...current,
        [currentQuestion.id]: {
          ...current[currentQuestion.id],
          selectedOptionIds: nextSelected
        }
      };
    });
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
      const unansweredIndex = session.questions.findIndex((question) => !hasAnswer(question));

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

  const answeredCount = session.questions.filter((question) => hasAnswer(question)).length;

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Проверочный блок"
        subtitle={session.lectureTitle}
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill theme={theme} label={`Вопрос ${currentIndex + 1}/${session.questions.length}`} tone="info" />
            <StatusPill theme={theme} label={`${answeredCount} заполнено`} tone="success" />
          </View>
        }
      />

      <SectionCard
        theme={theme}
        title="Таймер и прогресс"
        subtitle="Можно переходить между вопросами до финальной отправки"
      >
        <Text style={styles.timer}>{timerLabel}</Text>
        <Text style={styles.metaText}>Если время закончится, ответы отправятся автоматически.</Text>

        <View style={styles.progressRow}>
          {session.questions.map((question, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = hasAnswer(question);

            return (
              <Pressable
                key={question.id}
                onPress={() => {
                  setCurrentIndex(index);
                  setErrorText("");
                }}
                style={[
                  styles.progressChip,
                  {
                    borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
                    backgroundColor: isAnswered ? theme.colors.surfaceMuted : theme.colors.surface
                  }
                ]}
              >
                <Text
                  style={[
                    styles.progressChipText,
                    { color: isCurrent ? theme.colors.primary : theme.colors.text }
                  ]}
                >
                  {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard
        theme={theme}
        title={`Вопрос ${currentIndex + 1}`}
        subtitle={questionTypeLabel(currentQuestion)}
      >
        <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

        {currentQuestion.type === "single-choice"
          ? currentQuestion.options?.map((option) => {
              const isSelected = option.id === currentDraft.selectedOptionId;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectSingleOption(option.id)}
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

        {currentQuestion.type === "multiple-choice" ? (
          <>
            <Text style={styles.helperText}>Можно выбрать несколько вариантов.</Text>

            {currentQuestion.options?.map((option) => {
              const selectedIds = currentDraft.selectedOptionIds ?? [];
              const isSelected = selectedIds.includes(option.id);

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleToggleMultipleOption(option.id)}
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
            })}
          </>
        ) : null}

        {currentQuestion.type === "short-answer" ? (
          <AppInput
            label="Ответ"
            value={currentDraft.shortAnswer ?? ""}
            onChangeText={handleShortAnswer}
            placeholder="Введите ответ"
            keyboardType="numeric"
            theme={theme}
          />
        ) : null}

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

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
            <Text style={styles.navButtonText}>Назад</Text>
          </Pressable>

          <Pressable
            onPress={() => setCurrentIndex((current) => Math.min(session.questions.length - 1, current + 1))}
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
            <Text style={styles.navButtonText}>Далее</Text>
          </Pressable>
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label={`Отправить ответы (${answeredCount}/${session.questions.length})`}
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
    helperText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
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
      fontWeight: "600",
      color: theme.colors.text
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
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md
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
      fontWeight: "700",
      color: theme.colors.text
    },
    progressRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: theme.spacing.md
    },
    progressChip: {
      minWidth: 40,
      height: 40,
      borderWidth: 1,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    progressChipText: {
      fontSize: theme.typography.body,
      fontWeight: "700"
    }
  });
}


