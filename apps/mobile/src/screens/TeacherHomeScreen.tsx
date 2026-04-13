import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LectureDetails, QuizQuestion } from "@vm/shared";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { UserProfile } from "../mocks/user";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type DraftLectureInput = {
  title: string;
  description: string;
  theory: string;
  videoUrl: string;
  subject: string;
  semester: string;
  level: string;
};

export type DraftLectureMetaInput = {
  subject: string;
  semester: string;
  level: string;
  videoUrl: string;
};

export type DraftQuestionInput = {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionKey: "A" | "B" | "C" | "D";
  explanation: string;
};

type TeacherHomeScreenProps = {
  theme: AppTheme;
  user: UserProfile;
  lectures: LectureItem[];
  lectureDetailsById: Record<string, LectureDetails>;
  onOpenManageSession: (lecture: LectureItem) => void;
  onCreateDraftLecture: (input: DraftLectureInput) => string | null;
  onUpdateDraftLectureMeta: (lectureId: string, input: DraftLectureMetaInput) => void;
  onAddDraftQuestion: (lectureId: string, input: DraftQuestionInput) => void;
  onDeleteDraftQuestion: (lectureId: string, questionId: string) => void;
  onDeleteLecture: (lectureId: string) => void;
  onLogout: () => void;
};

export function TeacherHomeScreen({
  theme,
  user,
  lectures,
  lectureDetailsById,
  onOpenManageSession,
  onCreateDraftLecture,
  onUpdateDraftLectureMeta,
  onAddDraftQuestion,
  onDeleteDraftQuestion,
  onDeleteLecture,
  onLogout
}: TeacherHomeScreenProps) {
  const styles = createStyles(theme);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theory, setTheory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [subject, setSubject] = useState("Математический анализ");
  const [semester, setSemester] = useState("1 семестр");
  const [level, setLevel] = useState("Базовый");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);

  const [metaSubject, setMetaSubject] = useState("");
  const [metaSemester, setMetaSemester] = useState("");
  const [metaLevel, setMetaLevel] = useState("");
  const [metaVideoUrl, setMetaVideoUrl] = useState("");
  const [metaSuccess, setMetaSuccess] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOptionKey, setCorrectOptionKey] = useState<"A" | "B" | "C" | "D">("A");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [questionSuccess, setQuestionSuccess] = useState("");

  const expandedLecture = useMemo(
    () => lectures.find((lecture) => lecture.id === expandedLectureId) ?? null,
    [expandedLectureId, lectures]
  );

  const expandedTheory = useMemo(
    () => getTheoryPreview(expandedLectureId ? lectureDetailsById[expandedLectureId] : undefined),
    [expandedLectureId, lectureDetailsById]
  );

  const expandedQuestions = useMemo(
    () => getQuestions(expandedLectureId ? lectureDetailsById[expandedLectureId] : undefined),
    [expandedLectureId, lectureDetailsById]
  );

  const totalQuestions = useMemo(
    () => lectures.reduce((sum, lecture) => sum + getQuestions(lectureDetailsById[lecture.id]).length, 0),
    [lectureDetailsById, lectures]
  );

  const totalDraftLectures = useMemo(
    () => lectures.filter((lecture) => lecture.id.startsWith("draft-lecture-")).length,
    [lectures]
  );

  const normalizedTeacherName = fixText(user.fullName || "");
  const teacherDisplayName = /[А-Яа-яЁёA-Za-z]/.test(normalizedTeacherName)
    ? normalizedTeacherName
    : "Преподаватель VisualMath";
  const teacherVideoUrl =
    expandedLecture ? ((expandedLecture as LectureItem & { videoUrl?: string }).videoUrl ?? "") : "";

  useEffect(() => {
    if (!expandedLecture) {
      setMetaSubject("");
      setMetaSemester("");
      setMetaLevel("");
      setMetaVideoUrl("");
      return;
    }

    setMetaSubject(expandedLecture.subject || "");
    setMetaSemester(expandedLecture.semester || "");
    setMetaLevel(expandedLecture.level || "");
    setMetaVideoUrl(teacherVideoUrl);
  }, [expandedLecture, teacherVideoUrl]);

  function resetQuestionForm() {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOptionKey("A");
    setQuestionExplanation("");
    setQuestionError("");
    setQuestionSuccess("");
  }

  function handleCreateLecture() {
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    const nextTheory = theory.trim();
    const nextSubject = subject.trim();
    const nextSemester = semester.trim();
    const nextLevel = level.trim();

    if (!nextTitle) {
      setCreateSuccess("");
      setCreateError("Введите название лекции.");
      return;
    }

    if (!nextDescription) {
      setCreateSuccess("");
      setCreateError("Введите краткое описание.");
      return;
    }

    if (!nextTheory) {
      setCreateSuccess("");
      setCreateError("Введите теоретический материал.");
      return;
    }

    if (!nextSubject || !nextSemester || !nextLevel) {
      setCreateSuccess("");
      setCreateError("Заполните предмет, семестр и уровень.");
      return;
    }

    const createdLectureId = onCreateDraftLecture({
      title: nextTitle,
      description: nextDescription,
      theory: nextTheory,
      subject: nextSubject,
      semester: nextSemester,
      level: nextLevel,
      videoUrl: videoUrl.trim()
    });

    if (!createdLectureId) {
      setCreateSuccess("");
      setCreateError("Не удалось создать лекцию.");
      return;
    }

    setTitle("");
    setDescription("");
    setTheory("");
    setVideoUrl("");
    setSubject("Математический анализ");
    setSemester("1 семестр");
    setLevel("Базовый");
    setCreateError("");
    setCreateSuccess("Лекция создана. Теперь можно открыть редактор и добавить вопросы.");
    setExpandedLectureId(createdLectureId);
    resetQuestionForm();
  }

  function handleToggleEditor(lectureId: string) {
    setQuestionError("");
    setQuestionSuccess("");
    setMetaSuccess("");

    if (expandedLectureId === lectureId) {
      setExpandedLectureId(null);
      return;
    }

    setExpandedLectureId(lectureId);
    resetQuestionForm();
  }

  function handleSaveMeta() {
    if (!expandedLecture) {
      return;
    }

    const nextSubject = metaSubject.trim();
    const nextSemester = metaSemester.trim();
    const nextLevel = metaLevel.trim();

    if (!nextSubject || !nextSemester || !nextLevel) {
      setMetaSuccess("");
      return;
    }

    onUpdateDraftLectureMeta(expandedLecture.id, {
      subject: nextSubject,
      semester: nextSemester,
      level: nextLevel,
      videoUrl: metaVideoUrl.trim()
    });

    setMetaSuccess("Параметры лекции обновлены.");
  }

  function handleAddQuestion() {
    if (!expandedLecture) {
      return;
    }

    if (!questionText.trim()) {
      setQuestionSuccess("");
      setQuestionError("Введите текст вопроса.");
      return;
    }

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setQuestionSuccess("");
      setQuestionError("Заполните все четыре варианта ответа.");
      return;
    }

    onAddDraftQuestion(expandedLecture.id, {
      text: questionText.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctOptionKey,
      explanation: questionExplanation.trim()
    });

    resetQuestionForm();
    setQuestionSuccess("Вопрос добавлен.");
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Кабинет преподавателя"
        subtitle="Создавай лекции, управляй структурой курса, добавляй вопросы и запускай сессии."
        rightSlot={
          <View style={styles.headerRoleChip}>
            <Text style={styles.headerRoleChipText}>Преподаватель</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Рабочее пространство</Text>
          <Text style={styles.heroTitle}>{teacherDisplayName}</Text>
          <Text style={styles.heroSubtitle}>
            Управляй лекциями, материалами и проверочными блоками из единого кабинета.
          </Text>

          <View style={styles.quickInfoRow}>
            <InfoBadge theme={theme} label={fixText(`Логин: ${user.login}`)} />
            <InfoBadge theme={theme} label={fixText(`Группа: ${user.group}`)} />
          </View>

          <View style={styles.heroActions}>
            <AppButton
              label="Выйти из аккаунта"
              onPress={onLogout}
              theme={theme}
              variant="ghost"
              fullWidth={false}
              style={styles.heroActionButton}
            />
          </View>
        </View>

        <View style={styles.heroStats}>
          <StatTile theme={theme} value={String(lectures.length)} label="Всего лекций" />
          <StatTile theme={theme} value={String(totalDraftLectures)} label="Черновиков" />
          <StatTile theme={theme} value={String(totalQuestions)} label="Вопросов" />
        </View>
      </View>

      <View style={styles.dashboardRow}>
        <SectionCard
          theme={theme}
          title="Быстрое создание лекции"
          subtitle="Сначала создаём основу курса, потом открываем редактор и добавляем вопросы."
          style={styles.dashboardCardWide}
        >
          <AppInput
            label="Название лекции"
            theme={theme}
            value={title}
            onChangeText={setTitle}
            placeholder="Например: Производная и касательная"
            autoCorrect={false}
          />

          <AppInput
            label="Краткое описание"
            theme={theme}
            value={description}
            onChangeText={setDescription}
            placeholder="О чём эта лекция"
            multiline
            numberOfLines={3}
          />

          <AppInput
            label="Теоретический материал"
            theme={theme}
            value={theory}
            onChangeText={setTheory}
            placeholder="Вставь основной текст лекции"
            multiline
            numberOfLines={8}
          />

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <AppInput
                label="Предмет"
                theme={theme}
                value={subject}
                onChangeText={setSubject}
                placeholder="Математический анализ"
              />
            </View>

            <View style={styles.tripleCol}>
              <AppInput
                label="Семестр"
                theme={theme}
                value={semester}
                onChangeText={setSemester}
                placeholder="1 семестр"
              />
            </View>

            <View style={styles.tripleCol}>
              <AppInput
                label="Уровень"
                theme={theme}
                value={level}
                onChangeText={setLevel}
                placeholder="Базовый"
              />
            </View>
          </View>

          <AppInput
            label="Ссылка на видеоматериал"
            theme={theme}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://..."
            autoCapitalize="none"
            autoCorrect={false}
          />

          {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
          {createSuccess ? <Text style={styles.successText}>{createSuccess}</Text> : null}

          <AppButton
            label="Создать лекцию"
            onPress={handleCreateLecture}
            theme={theme}
            style={styles.actionTop}
          />
        </SectionCard>

        <SectionCard
          theme={theme}
          title="Фокус дня"
          subtitle="Быстрый доступ к самым важным действиям преподавателя."
          style={styles.dashboardCardNarrow}
        >
          <ActionMiniCard
            theme={theme}
            title="Лекции"
            subtitle="Открывай редактор и настраивай структуру."
          />
          <ActionMiniCard
            theme={theme}
            title="Сессии"
            subtitle="Запускай занятие и переключай блоки."
          />
          <ActionMiniCard
            theme={theme}
            title="Вопросы"
            subtitle="Добавляй проверочные блоки к каждой лекции."
          />
          <ActionMiniCard
            theme={theme}
            title="LaTeX"
            subtitle="Подготавливай материалы и PDF-версию курса."
          />
        </SectionCard>
      </View>

      <SectionCard
        theme={theme}
        title="Лекции преподавателя"
        subtitle="Ниже — все лекции. Можно запускать сессию, открыть редактор и управлять вопросами."
      >
        {lectures.length === 0 ? (
          <Text style={styles.emptyText}>Пока нет лекций. Создай первую лекцию выше.</Text>
        ) : (
          lectures.map((lecture) => {
            const isExpanded = expandedLectureId === lecture.id;
            const questions = getQuestions(lectureDetailsById[lecture.id]);
            const videoValue = (lecture as LectureItem & { videoUrl?: string }).videoUrl ?? "";

            return (
              <View
                key={lecture.id}
                style={[
                  styles.lectureCard,
                  isExpanded ? styles.lectureCardExpanded : null
                ]}
              >
                <View style={styles.lectureCardTop}>
                  <View style={styles.lectureCardText}>
                    <View style={styles.cardBadgeRow}>
                      <TinyPill theme={theme} label={fixText(lecture.subject)} tone="primary" />
                      <TinyPill theme={theme} label={fixText(lecture.level)} tone="neutral" />
                      {lecture.id.startsWith("draft-lecture-") ? (
                        <TinyPill theme={theme} label="Черновик" tone="success" />
                      ) : null}
                    </View>

                    <Text style={styles.lectureTitle}>{fixText(lecture.title)}</Text>
                    <Text style={styles.lectureMeta}>
                      {fixText(lecture.subject)} • {fixText(lecture.semester)} • {fixText(lecture.level)}
                    </Text>
                    <Text style={styles.lectureDescription}>{fixText(lecture.description)}</Text>

                    <View style={styles.metaPanel}>
                      <MetaItem theme={theme} label="Блоков" value={String(lecture.blocks.length)} />
                      <MetaItem theme={theme} label="Вопросов" value={String(questions.length)} />
                      <MetaItem theme={theme} label="Длительность" value={fixText(lecture.estimatedDuration)} />
                    </View>

                    {videoValue ? (
                      <Text style={styles.videoHint}>{fixText(`Видео: ${videoValue}`)}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <AppButton
                    label="Запустить сессию"
                    onPress={() => onOpenManageSession(lecture)}
                    theme={theme}
                    fullWidth={false}
                    style={styles.inlineButton}
                  />
                  <AppButton
                    label={isExpanded ? "Скрыть редактор" : "Открыть редактор"}
                    onPress={() => handleToggleEditor(lecture.id)}
                    theme={theme}
                    variant="secondary"
                    fullWidth={false}
                    style={styles.inlineButton}
                  />
                  <AppButton
                    label="Удалить лекцию"
                    onPress={() => onDeleteLecture(lecture.id)}
                    theme={theme}
                    variant="ghost"
                    fullWidth={false}
                    style={styles.inlineButton}
                  />
                </View>

                {isExpanded ? (
                  <View style={styles.editorShell}>
                    <View style={styles.editorGrid}>
                      <SectionCard
                        theme={theme}
                        title="Параметры лекции"
                        subtitle="Редактируй основные метаданные и ссылку на видео."
                        style={styles.innerCard}
                      >
                        <AppInput
                          label="Предмет"
                          theme={theme}
                          value={metaSubject}
                          onChangeText={setMetaSubject}
                          placeholder="Предмет"
                        />

                        <AppInput
                          label="Семестр"
                          theme={theme}
                          value={metaSemester}
                          onChangeText={setMetaSemester}
                          placeholder="Семестр"
                        />

                        <AppInput
                          label="Уровень"
                          theme={theme}
                          value={metaLevel}
                          onChangeText={setMetaLevel}
                          placeholder="Уровень"
                        />

                        <AppInput
                          label="Ссылка на видео"
                          theme={theme}
                          value={metaVideoUrl}
                          onChangeText={setMetaVideoUrl}
                          placeholder="https://..."
                          autoCapitalize="none"
                          autoCorrect={false}
                        />

                        {metaSuccess ? <Text style={styles.successText}>{metaSuccess}</Text> : null}

                        <AppButton
                          label="Сохранить параметры"
                          onPress={handleSaveMeta}
                          theme={theme}
                          style={styles.actionTop}
                        />
                      </SectionCard>

                      <SectionCard
                        theme={theme}
                        title="Теория лекции"
                        subtitle="Сейчас здесь предпросмотр. Основной текст задаётся при создании лекции."
                        style={styles.innerCard}
                      >
                        <Text style={styles.theoryPreview}>
                          {fixText(expandedTheory || "Теория пока не добавлена.")}
                        </Text>
                      </SectionCard>
                    </View>

                    <View style={styles.editorGrid}>
                      <SectionCard
                        theme={theme}
                        title="Добавить вопрос"
                        subtitle="Собери новый вопрос для проверочного блока."
                        style={styles.innerCard}
                      >
                        <AppInput
                          label="Текст вопроса"
                          theme={theme}
                          value={questionText}
                          onChangeText={setQuestionText}
                          placeholder="Введите вопрос"
                          multiline
                          numberOfLines={3}
                        />

                        <View style={styles.doubleRow}>
                          <View style={styles.doubleCol}>
                            <AppInput
                              label="Вариант A"
                              theme={theme}
                              value={optionA}
                              onChangeText={setOptionA}
                              placeholder="Первый вариант"
                            />
                          </View>
                          <View style={styles.doubleCol}>
                            <AppInput
                              label="Вариант B"
                              theme={theme}
                              value={optionB}
                              onChangeText={setOptionB}
                              placeholder="Второй вариант"
                            />
                          </View>
                        </View>

                        <View style={styles.doubleRow}>
                          <View style={styles.doubleCol}>
                            <AppInput
                              label="Вариант C"
                              theme={theme}
                              value={optionC}
                              onChangeText={setOptionC}
                              placeholder="Третий вариант"
                            />
                          </View>
                          <View style={styles.doubleCol}>
                            <AppInput
                              label="Вариант D"
                              theme={theme}
                              value={optionD}
                              onChangeText={setOptionD}
                              placeholder="Четвёртый вариант"
                            />
                          </View>
                        </View>

                        <Text style={styles.sectionLabel}>Правильный ответ</Text>
                        <View style={styles.optionRow}>
                          {(["A", "B", "C", "D"] as const).map((key) => (
                            <Pressable
                              key={key}
                              onPress={() => setCorrectOptionKey(key)}
                              style={[
                                styles.answerChip,
                                correctOptionKey === key ? styles.answerChipActive : null
                              ]}
                            >
                              <Text
                                style={[
                                  styles.answerChipText,
                                  correctOptionKey === key ? styles.answerChipTextActive : null
                                ]}
                              >
                                {key}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        <AppInput
                          label="Пояснение"
                          theme={theme}
                          value={questionExplanation}
                          onChangeText={setQuestionExplanation}
                          placeholder="Короткое пояснение к правильному ответу"
                          multiline
                          numberOfLines={3}
                        />

                        {questionError ? <Text style={styles.errorText}>{questionError}</Text> : null}
                        {questionSuccess ? <Text style={styles.successText}>{questionSuccess}</Text> : null}

                        <AppButton
                          label="Добавить вопрос"
                          onPress={handleAddQuestion}
                          theme={theme}
                          style={styles.actionTop}
                        />
                      </SectionCard>

                      <SectionCard
                        theme={theme}
                        title="Текущие вопросы"
                        subtitle="Список вопросов для этой лекции."
                        style={styles.innerCard}
                      >
                        {expandedQuestions.length === 0 ? (
                          <Text style={styles.emptyText}>Пока нет вопросов.</Text>
                        ) : (
                          expandedQuestions.map((question, index) => (
                            <View key={question.id} style={styles.questionCard}>
                              <Text style={styles.questionTitle}>
                                {index + 1}. {fixText(question.text)}
                              </Text>

                              {question.options?.map((option) => (
                                <Text key={option.id} style={styles.questionOption}>
                                  {option.id}. {fixText(option.text)}
                                </Text>
                              ))}

                              {question.correctAnswerHint ? (
                                <Text style={styles.questionHint}>{fixText(question.correctAnswerHint)}</Text>
                              ) : null}

                              <AppButton
                                label="Удалить вопрос"
                                onPress={() => onDeleteDraftQuestion(lecture.id, question.id)}
                                theme={theme}
                                variant="secondary"
                                style={styles.questionDeleteButton}
                              />
                            </View>
                          ))
                        )}
                      </SectionCard>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </SectionCard>
    </Screen>
  );
}

type StatTileProps = {
  theme: AppTheme;
  value: string;
  label: string;
};

function StatTile({ theme, value, label }: StatTileProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type InfoBadgeProps = {
  theme: AppTheme;
  label: string;
};

function InfoBadge({ theme, label }: InfoBadgeProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.infoBadge}>
      <Text style={styles.infoBadgeText}>{label}</Text>
    </View>
  );
}

type TinyPillProps = {
  theme: AppTheme;
  label: string;
  tone: "primary" | "neutral" | "success";
};

function TinyPill({ theme, label, tone }: TinyPillProps) {
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.tinyPill,
        tone === "primary" ? styles.tinyPillPrimary : null,
        tone === "neutral" ? styles.tinyPillNeutral : null,
        tone === "success" ? styles.tinyPillSuccess : null
      ]}
    >
      <Text
        style={[
          styles.tinyPillText,
          tone === "primary" ? styles.tinyPillTextPrimary : null,
          tone === "success" ? styles.tinyPillTextSuccess : null
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type MetaItemProps = {
  theme: AppTheme;
  label: string;
  value: string;
};

function MetaItem({ theme, label, value }: MetaItemProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaItemLabel}>{label}</Text>
      <Text style={styles.metaItemValue}>{value}</Text>
    </View>
  );
}

type ActionMiniCardProps = {
  theme: AppTheme;
  title: string;
  subtitle: string;
};

function ActionMiniCard({ theme, title, subtitle }: ActionMiniCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.actionMiniCard}>
      <Text style={styles.actionMiniTitle}>{title}</Text>
      <Text style={styles.actionMiniSubtitle}>{subtitle}</Text>
    </View>
  );
}

function getTheoryPreview(details?: LectureDetails): string {
  if (!details) {
    return "";
  }

  const theoryBlock = details.blocks.find((block) => block.type === "text");
  if (theoryBlock && theoryBlock.type === "text") {
    return theoryBlock.payload.markdown;
  }

  return details.description ?? "";
}

function getQuestions(details?: LectureDetails): QuizQuestion[] {
  if (!details) {
    return [];
  }

  const quizBlock = details.blocks.find((block) => block.type === "quiz");
  if (!quizBlock || quizBlock.type !== "quiz") {
    return [];
  }

  return quizBlock.payload.questions;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerRoleChip: {
      minHeight: 42,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerRoleChipText: {
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
      maxWidth: 760,
      marginBottom: theme.spacing.lg
    },
    quickInfoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    infoBadge: {
      minHeight: 34,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    infoBadgeText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    heroActions: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    heroActionButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    heroStats: {
      width: 260,
      minWidth: 220,
      justifyContent: "space-between"
    },
    statTile: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    statValue: {
      fontSize: 28,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    statLabel: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    dashboardRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    dashboardCardWide: {
      flexBasis: 760,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    dashboardCardNarrow: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    actionMiniCard: {
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    actionMiniTitle: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    actionMiniSubtitle: {
      fontSize: theme.typography.caption,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    tripleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    tripleCol: {
      flexBasis: 220,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs
    },
    doubleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    doubleCol: {
      flexBasis: 260,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs
    },
    actionTop: {
      marginTop: theme.spacing.sm
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      fontWeight: "700",
      marginTop: theme.spacing.xs
    },
    successText: {
      color: theme.colors.success,
      fontSize: theme.typography.caption,
      fontWeight: "700",
      marginTop: theme.spacing.xs
    },
    lectureCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.md,
      ...theme.shadow.md
    },
    lectureCardExpanded: {
      borderColor: theme.colors.primary
    },
    lectureCardTop: {
      marginBottom: theme.spacing.md
    },
    lectureCardText: {
      flex: 1
    },
    cardBadgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    tinyPill: {
      minHeight: 30,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      borderWidth: 1,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    tinyPillPrimary: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.primary
    },
    tinyPillNeutral: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border
    },
    tinyPillSuccess: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.success
    },
    tinyPillText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    tinyPillTextPrimary: {
      color: theme.colors.primary
    },
    tinyPillTextSuccess: {
      color: theme.colors.success
    },
    lectureTitle: {
      fontSize: theme.typography.sectionTitle,
      lineHeight: 28,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    lectureMeta: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    lectureDescription: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    metaPanel: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs,
      marginBottom: theme.spacing.sm
    },
    metaItem: {
      flexBasis: 140,
      flexGrow: 1,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    metaItemLabel: {
      fontSize: theme.typography.helper,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    metaItemValue: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    videoHint: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    editorShell: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border
    },
    editorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    innerCard: {
      flexBasis: 420,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    sectionLabel: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    theoryPreview: {
      fontSize: theme.typography.body,
      lineHeight: 25,
      color: theme.colors.text,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md
    },
    optionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    answerChip: {
      minWidth: 56,
      minHeight: 44,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    answerChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted,
      ...theme.shadow.sm
    },
    answerChipText: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    answerChipTextActive: {
      color: theme.colors.primary
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    questionCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md
    },
    questionTitle: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    questionOption: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    questionHint: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    questionDeleteButton: {
      alignSelf: "flex-start"
    }
  });
}
