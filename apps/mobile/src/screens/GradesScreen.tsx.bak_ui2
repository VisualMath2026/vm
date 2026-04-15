import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { HomeworkItem, HomeworkSubmissionItem } from "../storage/homeworkStorage";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

type GradesScreenProps = {
  theme: AppTheme;
  isTeacher: boolean;
  userLogin: string;
  userName: string;
  homeworks: HomeworkItem[];
  submissions: HomeworkSubmissionItem[];
  onGradeSubmission: (submissionId: string, score: number | null, comment: string) => void;
};

type StudentGradeRow = {
  homework: HomeworkItem;
  submission: HomeworkSubmissionItem | null;
};

type TeacherGradeRow = {
  homework: HomeworkItem;
  relatedSubmissions: HomeworkSubmissionItem[];
  checkedSubmissions: number;
  avgScore: number | null;
};

export function GradesScreen({
  theme,
  isTeacher,
  userLogin,
  userName,
  homeworks,
  submissions,
  onGradeSubmission
}: GradesScreenProps) {
  const styles = createStyles(theme);

  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [errorText, setErrorText] = useState("");

  const studentRows = useMemo(() => {
    return [...homeworks]
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .map((homework) => ({
        homework,
        submission:
          submissions.find(
            (submission) =>
              submission.homeworkId === homework.id &&
              submission.studentLogin === userLogin
          ) ?? null
      }));
  }, [homeworks, submissions, userLogin]);

  const teacherRows = useMemo(() => {
    return [...homeworks]
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .map((homework) => {
        const relatedSubmissions = submissions.filter((submission) => submission.homeworkId === homework.id);
        const checked = relatedSubmissions.filter((submission) => submission.score !== null);
        const avgScore =
          checked.length > 0
            ? checked.reduce((sum, submission) => sum + Number(submission.score ?? 0), 0) / checked.length
            : null;

        return {
          homework,
          relatedSubmissions,
          checkedSubmissions: checked.length,
          avgScore
        };
      });
  }, [homeworks, submissions]);

  const myCheckedCount = studentRows.filter((row) => row.submission?.score !== null).length;

  const myAverage = useMemo(() => {
    const checked = studentRows.filter((row) => row.submission?.score !== null);

    if (checked.length === 0) {
      return null;
    }

    const total = checked.reduce((sum, row) => sum + Number(row.submission?.score ?? 0), 0);
    return total / checked.length;
  }, [studentRows]);

  const checkedTeacherRows = teacherRows.filter((row) => row.checkedSubmissions > 0).length;

  function handleSaveGrade(submission: HomeworkSubmissionItem, homework: HomeworkItem) {
    const rawScore = (scoreDrafts[submission.id] ?? (submission.score !== null ? String(submission.score) : "")).trim();
    const rawComment = (commentDrafts[submission.id] ?? submission.teacherComment ?? "").trim();

    if (!rawScore) {
      onGradeSubmission(submission.id, null, rawComment);
      setErrorText("");
      return;
    }

    const parsedScore = Number(rawScore.replace(",", "."));

    if (!Number.isFinite(parsedScore)) {
      setErrorText("Введите корректную оценку.");
      return;
    }

    const normalizedScore = Math.max(0, Math.min(homework.maxScore, parsedScore));
    onGradeSubmission(submission.id, normalizedScore, rawComment);
    setErrorText("");
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Итоги по домашним заданиям"
        subtitle={isTeacher ? "Сводка и выставление оценок по домашним работам." : "Все оценки, комментарии и статусы проверки домашних заданий."}
        rightSlot={
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>
              {isTeacher ? `${teacherRows.length} заданий` : `${studentRows.length} записей`}
            </Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Результаты</Text>
          <Text style={styles.heroTitle}>
            {isTeacher ? "Журнал оценок по ДЗ" : fixText(userName || userLogin)}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isTeacher
              ? "Здесь можно просматривать сдачи, выставлять баллы и добавлять комментарии."
              : "Здесь отображаются статусы сдачи, выставленные оценки и комментарии преподавателя."}
          </Text>
          {errorText ? <Text style={styles.errorText}>{fixText(errorText)}</Text> : null}
        </View>

        <View style={styles.heroStats}>
          {isTeacher ? (
            <>
              <MiniStatCard theme={theme} value={String(teacherRows.length)} label="Заданий" />
              <MiniStatCard theme={theme} value={String(submissions.length)} label="Всего сдач" />
              <MiniStatCard theme={theme} value={String(checkedTeacherRows)} label="Есть оценки" />
            </>
          ) : (
            <>
              <MiniStatCard theme={theme} value={String(studentRows.length)} label="Заданий" />
              <MiniStatCard theme={theme} value={String(myCheckedCount)} label="Проверено" />
              <MiniStatCard
                theme={theme}
                value={myAverage !== null ? myAverage.toFixed(1) : "—"}
                label="Средний балл"
              />
            </>
          )}
        </View>
      </View>

      {isTeacher ? (
        <SectionCard
          theme={theme}
          title="Сводка преподавателя"
          subtitle="По каждому заданию можно сразу выставить оценку."
        >
          {teacherRows.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет данных по домашним заданиям.</Text>
          ) : (
            <View style={styles.cardList}>
              {teacherRows.map((row) => (
                <View key={row.homework.id} style={styles.resultCard}>
                  <View style={styles.resultTop}>
                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultTitle}>{fixText(row.homework.title)}</Text>
                      <Text style={styles.resultMeta}>
                        {fixText(`Дедлайн: ${formatDateTime(row.homework.dueAt)} • Макс. балл: ${row.homework.maxScore}`)}
                      </Text>
                    </View>

                    <StatusPill
                      theme={theme}
                      label={row.checkedSubmissions > 0 ? "Есть проверки" : "Ожидает"}
                      tone={row.checkedSubmissions > 0 ? "success" : "warning"}
                    />
                  </View>

                  <View style={styles.infoGrid}>
                    <InfoTile theme={theme} label="Сдач" value={String(row.relatedSubmissions.length)} />
                    <InfoTile theme={theme} label="Проверено" value={String(row.checkedSubmissions)} />
                    <InfoTile
                      theme={theme}
                      label="Средний балл"
                      value={row.avgScore !== null ? row.avgScore.toFixed(1) : "—"}
                    />
                    <InfoTile theme={theme} label="Макс. балл" value={String(row.homework.maxScore)} />
                  </View>

                  {row.relatedSubmissions.length === 0 ? (
                    <Text style={styles.emptyText}>По этому заданию пока нет сдач.</Text>
                  ) : (
                    row.relatedSubmissions.map((submission) => {
                      const scoreValue =
                        scoreDrafts[submission.id] ??
                        (submission.score !== null ? String(submission.score) : "");

                      const commentValue =
                        commentDrafts[submission.id] ??
                        submission.teacherComment ??
                        "";

                      return (
                        <View key={submission.id} style={styles.submissionCard}>
                          <View style={styles.submissionTop}>
                            <View style={styles.submissionTextWrap}>
                              <Text style={styles.submissionTitle}>{fixText(submission.studentName)}</Text>
                              <Text style={styles.submissionMeta}>{fixText(`Логин: ${submission.studentLogin}`)}</Text>
                              <Text style={styles.submissionMeta}>{fixText(`Файл: ${submission.fileName}`)}</Text>
                              <Text style={styles.submissionMeta}>{fixText(`Сдано: ${formatDateTime(submission.submittedAt)}`)}</Text>
                            </View>

                            <StatusPill
                              theme={theme}
                              label={submission.score !== null ? "Проверено" : "Ожидает проверки"}
                              tone={submission.score !== null ? "success" : "info"}
                            />
                          </View>

                          <View style={styles.inputGrid}>
                            <View style={styles.inputCol}>
                              <AppInput
                                label="Оценка"
                                theme={theme}
                                value={scoreValue}
                                onChangeText={(value) =>
                                  setScoreDrafts((current) => ({
                                    ...current,
                                    [submission.id]: value
                                  }))
                                }
                                placeholder={`0-${row.homework.maxScore}`}
                                keyboardType="numeric"
                              />
                            </View>

                            <View style={styles.inputColWide}>
                              <AppInput
                                label="Комментарий"
                                theme={theme}
                                value={commentValue}
                                onChangeText={(value) =>
                                  setCommentDrafts((current) => ({
                                    ...current,
                                    [submission.id]: value
                                  }))
                                }
                                placeholder="Комментарий преподавателя"
                              />
                            </View>
                          </View>

                          <AppButton
                            label="Сохранить оценку"
                            onPress={() => handleSaveGrade(submission, row.homework)}
                            theme={theme}
                            fullWidth={false}
                            style={styles.inlineButton}
                          />
                        </View>
                      );
                    })
                  )}
                </View>
              ))}
            </View>
          )}
        </SectionCard>
      ) : (
        <SectionCard
          theme={theme}
          title="Мои оценки"
          subtitle="Итоги по всем домашним заданиям."
        >
          {studentRows.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет данных по домашним заданиям.</Text>
          ) : (
            <View style={styles.cardList}>
              {studentRows.map((row) => (
                <View key={row.homework.id} style={styles.resultCard}>
                  <View style={styles.resultTop}>
                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultTitle}>{fixText(row.homework.title)}</Text>
                      <Text style={styles.resultMeta}>
                        {fixText(`Дедлайн: ${formatDateTime(row.homework.dueAt)} • Макс. балл: ${row.homework.maxScore}`)}
                      </Text>
                    </View>

                    <StatusPill
                      theme={theme}
                      label={studentStatusLabel(row)}
                      tone={studentStatusTone(row)}
                    />
                  </View>

                  <View style={styles.infoGrid}>
                    <InfoTile
                      theme={theme}
                      label="Оценка"
                      value={row.submission?.score !== null && row.submission?.score !== undefined ? String(row.submission.score) : "—"}
                    />
                    <InfoTile
                      theme={theme}
                      label="Сдано"
                      value={row.submission ? formatDateTime(row.submission.submittedAt) : "—"}
                    />
                    <InfoTile
                      theme={theme}
                      label="Файл"
                      value={row.submission?.fileName ?? "—"}
                    />
                    <InfoTile
                      theme={theme}
                      label="Макс. балл"
                      value={String(row.homework.maxScore)}
                    />
                  </View>

                  {row.submission?.teacherComment ? (
                    <Text style={styles.commentText}>{fixText(row.submission.teacherComment)}</Text>
                  ) : (
                    <Text style={styles.commentText}>
                      {row.submission ? "Комментарий преподавателя пока не добавлен." : "Работа ещё не была сдана."}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </SectionCard>
      )}
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

function studentStatusLabel(row: StudentGradeRow): string {
  if (row.submission?.score !== null && row.submission?.score !== undefined) {
    return "Проверено";
  }

  if (row.submission) {
    return "Сдано";
  }

  if (Date.now() > new Date(row.homework.dueAt).getTime()) {
    return "Просрочено";
  }

  return "Активно";
}

function studentStatusTone(row: StudentGradeRow) {
  if (row.submission?.score !== null && row.submission?.score !== undefined) {
    return "success";
  }

  if (row.submission) {
    return "info";
  }

  if (Date.now() > new Date(row.homework.dueAt).getTime()) {
    return "warning";
  }

  return "neutral";
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerChip: {
      minHeight: 42,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerChipText: {
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
      paddingRight: theme.spacing.lg
    },
    heroEyebrow: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.4
    },
    heroTitle: {
      fontSize: theme.typography.title,
      lineHeight: theme.typography.title + 6,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 26,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      maxWidth: 760
    },
    errorText: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.danger
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
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    cardList: {
      width: "100%"
    },
    resultCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      ...theme.shadow.md
    },
    resultTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    resultTextWrap: {
      flex: 1,
      paddingRight: theme.spacing.md
    },
    resultTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    resultMeta: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs,
      marginBottom: theme.spacing.sm
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
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    infoTileValue: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    commentText: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary
    },
    submissionCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: theme.spacing.md
    },
    submissionTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    submissionTextWrap: {
      flex: 1,
      paddingRight: theme.spacing.md
    },
    submissionTitle: {
      fontSize: theme.typography.body,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    submissionMeta: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    inputGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    inputCol: {
      flexBasis: 180,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs
    },
    inputColWide: {
      flexBasis: 360,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs
    },
    inlineButton: {
      marginTop: theme.spacing.sm
    }
  });
}
