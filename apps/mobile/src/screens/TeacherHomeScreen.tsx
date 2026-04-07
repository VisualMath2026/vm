import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LectureDetails, QuizQuestion } from "@vm/shared";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { UserProfile } from "../mocks/user";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type DraftLectureInput = {
  title: string;
  description: string;
  theory: string;
  subject: string;
  semester: string;
  level: string;
};

export type DraftLectureMetaInput = {
  subject: string;
  semester: string;
  level: string;
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
  const [subject, setSubject] = useState("Математический анализ");
  const [semester, setSemester] = useState("1 семестр");
  const [level, setLevel] = useState("Базовый");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);

  const [metaSubject, setMetaSubject] = useState("");
  const [metaSemester, setMetaSemester] = useState("");
  const [metaLevel, setMetaLevel] = useState("");
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

  useEffect(() => {
    if (!expandedLecture) {
      setMetaSubject("");
      setMetaSemester("");
      setMetaLevel("");
      return;
    }

    setMetaSubject(expandedLecture.subject || "");
    setMetaSemester(expandedLecture.semester || "");
    setMetaLevel(expandedLecture.level || "");
  }, [expandedLecture]);

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
      setCreateError("Введите теорию лекции.");
      return;
    }

    if (!nextSubject || !nextSemester || !nextLevel) {
      setCreateSuccess("");
      setCreateError("Заполните подписи под названием.");
      return;
    }

    const createdLectureId = onCreateDraftLecture({
      title: nextTitle,
      description: nextDescription,
      theory: nextTheory,
      subject: nextSubject,
      semester: nextSemester,
      level: nextLevel
    });

    if (!createdLectureId) {
      setCreateSuccess("");
      setCreateError("Не удалось создать лекцию.");
      return;
    }

    setTitle("");
    setDescription("");
    setTheory("");
    setSubject("Математический анализ");
    setSemester("1 семестр");
    setLevel("Базовый");
    setCreateError("");
    setCreateSuccess("Лекция создана. Можно менять подписи и добавлять вопросы.");
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
      level: nextLevel
    });

    setMetaSuccess("Подписи обновлены.");
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
      <Text style={styles.title}>Кабинет преподавателя</Text>
      <Text style={styles.subtitle}>Создание лекций, теории, подписей и вопросов.</Text>

      <SectionCard title={user.login === "teacher" ? "\u0421\u0435\u0440\u0433\u0435\u0439 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c" : "\u041f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c"} subtitle="Преподаватель" theme={theme}>
        <Text style={styles.metaText}>Логин: {user.login}</Text>
        <Text style={styles.metaText}>Роль: преподаватель</Text>
        <Text style={styles.metaText}>Группа: {user.group}</Text>
      </SectionCard>

      <SectionCard title="Новая лекция" subtitle="Заполните все поля" theme={theme}>
        <AppInput
          label="Название лекции"
          theme={theme}
          value={title}
          onChangeText={setTitle}
          placeholder="Например: Производная"
          autoCorrect={false}
        />

        <AppInput
          label="Краткое описание"
          theme={theme}
          value={description}
          onChangeText={setDescription}
          placeholder="Короткое описание лекции"
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        <AppInput
          label="Теория"
          theme={theme}
          value={theory}
          onChangeText={setTheory}
          placeholder="Теоретический материал"
          multiline
          numberOfLines={8}
          style={styles.theoryInput}
        />

        <AppInput
          label="Подпись 1"
          theme={theme}
          value={subject}
          onChangeText={setSubject}
          placeholder="Например: Математический анализ"
        />

        <AppInput
          label="Подпись 2"
          theme={theme}
          value={semester}
          onChangeText={setSemester}
          placeholder="Например: 1 семестр"
        />

        <AppInput
          label="Подпись 3"
          theme={theme}
          value={level}
          onChangeText={setLevel}
          placeholder="Например: Базовый"
        />

        {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
        {createSuccess ? <Text style={styles.successText}>{createSuccess}</Text> : null}

        <AppButton
          label="Добавить лекцию"
          onPress={handleCreateLecture}
          theme={theme}
          style={styles.actionTop}
        />
      </SectionCard>

      <SectionCard
        title="Лекции преподавателя"
        subtitle="Можно менять подписи, теорию и вопросы"
        theme={theme}
      >
        {lectures.map((lecture) => {
          const isExpanded = expandedLectureId === lecture.id;
          const questions = getQuestions(lectureDetailsById[lecture.id]);

          return (
            <View key={lecture.id} style={styles.lectureCard}>
              <Text style={styles.lectureTitle}>{lecture.title}</Text>
              <Text style={styles.lectureMeta}>
                {lecture.subject} • {lecture.semester} • {lecture.level}
              </Text>
              <Text style={styles.lectureDescription}>{lecture.description}</Text>
              <Text style={styles.counterText}>Вопросов: {questions.length}</Text>

              <View style={styles.row}>
                <AppButton
                  label="Сессия"
                  onPress={() => onOpenManageSession(lecture)}
                  theme={theme}
                  variant="secondary"
                  fullWidth={false}
                  style={styles.inlineButton}
                />
                <AppButton
                  label={isExpanded ? "Скрыть редактор" : "Редактировать"}
                  onPress={() => handleToggleEditor(lecture.id)}
                  theme={theme}
                  fullWidth={false}
                  style={styles.inlineButton}
                />
                  <AppButton
                    label="Удалить лекцию"
                    onPress={() => onDeleteLecture(lecture.id)}
                    theme={theme}
                    variant="secondary"
                    fullWidth={false}
                    style={styles.inlineButton}
                  />
              </View>

              {isExpanded ? (
                <View style={styles.editorBox}>
                  <Text style={styles.sectionLabel}>Подписи под названием</Text>

                  <AppInput
                    label="Подпись 1"
                    theme={theme}
                    value={metaSubject}
                    onChangeText={setMetaSubject}
                    placeholder="Первая подпись"
                  />

                  <AppInput
                    label="Подпись 2"
                    theme={theme}
                    value={metaSemester}
                    onChangeText={setMetaSemester}
                    placeholder="Вторая подпись"
                  />

                  <AppInput
                    label="Подпись 3"
                    theme={theme}
                    value={metaLevel}
                    onChangeText={setMetaLevel}
                    placeholder="Третья подпись"
                  />

                  {metaSuccess ? <Text style={styles.successText}>{metaSuccess}</Text> : null}

                  <AppButton
                    label="Сохранить подписи"
                    onPress={handleSaveMeta}
                    theme={theme}
                    style={styles.actionTop}
                  />

                  <Text style={styles.sectionLabel}>Теория</Text>
                  <Text style={styles.theoryPreview}>
                    {expandedTheory || "Теория пока не добавлена."}
                  </Text>

                  <Text style={styles.sectionLabel}>Новый вопрос</Text>

                  <AppInput
                    label="Текст вопроса"
                    theme={theme}
                    value={questionText}
                    onChangeText={setQuestionText}
                    placeholder="Введите вопрос"
                    multiline
                    numberOfLines={3}
                    style={styles.multilineInput}
                  />

                  <AppInput
                    label="Вариант A"
                    theme={theme}
                    value={optionA}
                    onChangeText={setOptionA}
                    placeholder="Первый вариант"
                  />

                  <AppInput
                    label="Вариант B"
                    theme={theme}
                    value={optionB}
                    onChangeText={setOptionB}
                    placeholder="Второй вариант"
                  />

                  <AppInput
                    label="Вариант C"
                    theme={theme}
                    value={optionC}
                    onChangeText={setOptionC}
                    placeholder="Третий вариант"
                  />

                  <AppInput
                    label="Вариант D"
                    theme={theme}
                    value={optionD}
                    onChangeText={setOptionD}
                    placeholder="Четвертый вариант"
                  />

                  <Text style={styles.sectionLabel}>Правильный ответ</Text>
                  <View style={styles.row}>
                    {(["A", "B", "C", "D"] as const).map((key) => (
                      <AppButton
                        key={key}
                        label={key}
                        onPress={() => setCorrectOptionKey(key)}
                        theme={theme}
                        variant={correctOptionKey === key ? "primary" : "secondary"}
                        fullWidth={false}
                        style={styles.optionButton}
                      />
                    ))}
                  </View>

                  <AppInput
                    label="Пояснение"
                    theme={theme}
                    value={questionExplanation}
                    onChangeText={setQuestionExplanation}
                    placeholder="Короткое пояснение"
                    multiline
                    numberOfLines={3}
                    style={styles.multilineInput}
                  />

                  {questionError ? <Text style={styles.errorText}>{questionError}</Text> : null}
                  {questionSuccess ? <Text style={styles.successText}>{questionSuccess}</Text> : null}

                  <AppButton
                    label="Добавить вопрос"
                    onPress={handleAddQuestion}
                    theme={theme}
                    style={styles.actionTop}
                  />

                  <Text style={styles.sectionLabel}>Список вопросов</Text>

                  {expandedQuestions.length === 0 ? (
                    <Text style={styles.emptyText}>Пока нет вопросов.</Text>
                  ) : (
                    expandedQuestions.map((question, index) => (
                      <View key={question.id} style={styles.questionCard}>
                        <Text style={styles.questionTitle}>
                          {index + 1}. {question.text}
                        </Text>
                        {question.options?.map((option) => (
                          <Text key={option.id} style={styles.questionOption}>
                            {option.id}. {option.text}
                          </Text>
                        ))}
                        {question.correctAnswerHint ? (
                          <Text style={styles.questionHint}>{question.correctAnswerHint}</Text>
                        ) : null}
                        <AppButton
                          label="Удалить вопрос"
                          onPress={() => onDeleteDraftQuestion(lecture.id, question.id)}
                          theme={theme}
                          variant="secondary"
                          style={styles.actionTop}
                        />
                      </View>
                    ))
                  )}
                </View>
              ) : null}
            </View>
          );
        })}

        <AppButton
          label="Выйти из аккаунта"
          onPress={onLogout}
          theme={theme}
          variant="ghost"
          style={styles.actionTop}
        />
      </SectionCard>
    </Screen>
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
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    multilineInput: {
      minHeight: 96,
      textAlignVertical: "top"
    },
    theoryInput: {
      minHeight: 180,
      textAlignVertical: "top"
    },
    actionTop: {
      marginTop: theme.spacing.md
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    successText: {
      color: theme.colors.success,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    lectureCard: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    lectureTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    lectureMeta: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    lectureDescription: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    counterText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: theme.spacing.sm
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    optionButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      minWidth: 56
    },
    editorBox: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border
    },
    sectionLabel: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: "700",
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm
    },
    theoryPreview: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    questionCard: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.input
    },
    questionTitle: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    questionOption: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    questionHint: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm
    }
  });
}