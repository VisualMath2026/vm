import React, { useMemo, useState } from "react";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type VideoLessonItem = {
  id: string;
  title: string;
  url: string;
  authorName: string;
  createdAt: string;
  teacherLogin?: string;
};

type VideoLessonsScreenProps = {
  theme: AppTheme;
  isTeacher: boolean;
  lessons: VideoLessonItem[];
  onCreateLesson: (input: { title: string; url: string }) => void;
  onDeleteLesson: (lessonId: string) => void;
};

export function VideoLessonsScreen({
  theme,
  isTeacher,
  lessons,
  onCreateLesson,
  onDeleteLesson
}: VideoLessonsScreenProps) {
  const styles = createStyles(theme);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filteredLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return lessons;
    }

    return lessons.filter((lesson) =>
      [lesson.title, lesson.authorName, lesson.url].join(" ").toLowerCase().includes(normalized)
    );
  }, [lessons, query]);

  function handleCreate() {
    const nextTitle = title.trim();
    const nextUrl = url.trim();

    if (!nextTitle || !nextUrl) {
      setError("Заполните название и ссылку.");
      return;
    }

    onCreateLesson({
      title: nextTitle,
      url: nextUrl
    });

    setTitle("");
    setUrl("");
    setError("");
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Видеоуроки"
        subtitle="Коллекция видеоматериалов по лекциям, темам и отдельным математическим сюжетам."
        rightSlot={
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>{filteredLessons.length} видео</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Медиатека</Text>
          <Text style={styles.heroTitle}>
            {isTeacher ? "Управляй видеотекой курса" : "Смотри дополнительные видеоуроки"}
          </Text>
          <Text style={styles.heroSubtitle}>
            Видео можно использовать как для подготовки к занятиям, так и для повторения материала после лекции.
          </Text>

          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{isTeacher ? "Режим преподавателя" : "Режим студента"}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Всего: {lessons.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroStats}>
          <MiniStatCard theme={theme} value={String(lessons.length)} label="Всего уроков" />
          <MiniStatCard theme={theme} value={String(filteredLessons.length)} label="По фильтру" />
          <MiniStatCard theme={theme} value={isTeacher ? "Автор" : "Просмотр"} label="Режим" />
        </View>
      </View>

      <View style={styles.grid}>
        {isTeacher ? (
          <SectionCard
            title="Добавить видеоурок"
            subtitle="Добавьте название и ссылку на видео."
            theme={theme}
            style={styles.cardWide}
          >
            <AppInput
              label="Название урока"
              theme={theme}
              value={title}
              onChangeText={setTitle}
              placeholder="Например: Производная функции"
              autoCorrect={false}
            />

            <AppInput
              label="Ссылка на видео"
              theme={theme}
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              autoCorrect={false}
              autoCapitalize="none"
            />

            {error ? <Text style={styles.errorText}>{fixText(error)}</Text> : null}

            <AppButton
              label="Добавить видеоурок"
              onPress={handleCreate}
              theme={theme}
              style={styles.actionTop}
            />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Поиск по видео"
          subtitle="Ищи по названию, автору или ссылке."
          theme={theme}
          style={isTeacher ? styles.cardNarrow : styles.cardWide}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Например: производная, предел, Taylor..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchInput}
          />

          <View style={styles.searchMetaRow}>
            <Text style={styles.searchMetaText}>Найдено: {filteredLessons.length}</Text>
            {query.trim() ? (
              <AppButton
                label="Сбросить"
                onPress={() => setQuery("")}
                theme={theme}
                variant="secondary"
                fullWidth={false}
              />
            ) : null}
          </View>
        </SectionCard>
      </View>

      <SectionCard
        title="Библиотека видеоуроков"
        subtitle={
          filteredLessons.length > 0
            ? `Доступно уроков: ${filteredLessons.length}`
            : "Пока уроков нет"
        }
        theme={theme}
      >
        {filteredLessons.length === 0 ? (
          <Text style={styles.emptyText}>Пока нет добавленных видеоуроков.</Text>
        ) : (
          <View style={styles.lessonGrid}>
            {filteredLessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonCard}>
                <View style={styles.lessonPreview}>
                  <Text style={styles.lessonPreviewEyebrow}>Video lesson</Text>
                  <Text style={styles.lessonPreviewTitle}>{fixText(lesson.title)}</Text>
                </View>

                <Text style={styles.lessonTitle}>{fixText(lesson.title)}</Text>
                <Text style={styles.lessonMeta}>
                  {fixText(`Автор: ${lesson.authorName}`)}
                </Text>
                <Text style={styles.lessonDate}>
                  {fixText(`Добавлено: ${formatDate(lesson.createdAt)}`)}
                </Text>
                <Text numberOfLines={2} style={styles.lessonUrl}>
                  {lesson.url}
                </Text>

                <View style={styles.row}>
                  <AppButton
                    label="Открыть"
                    onPress={() => void Linking.openURL(lesson.url)}
                    theme={theme}
                    fullWidth={false}
                    style={styles.inlineButton}
                  />

                  {isTeacher ? (
                    <AppButton
                      label="Удалить"
                      onPress={() => onDeleteLesson(lesson.id)}
                      theme={theme}
                      variant="secondary"
                      fullWidth={false}
                      style={styles.inlineButton}
                    />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionCard>
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

function formatDate(value: string): string {
  const next = new Date(value);

  if (Number.isNaN(next.getTime())) {
    return "—";
  }

  return next.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
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
    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    heroBadge: {
      minHeight: 34,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    heroBadgeText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    cardWide: {
      flexBasis: 720,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    cardNarrow: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    searchInput: {
      minHeight: 56,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body,
      ...theme.shadow.sm
    },
    searchMetaRow: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    searchMetaText: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
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
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    lessonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    lessonCard: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.md
    },
    lessonPreview: {
      minHeight: 150,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      justifyContent: "space-between",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md
    },
    lessonPreviewEyebrow: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.4
    },
    lessonPreviewTitle: {
      fontSize: theme.typography.sectionTitle,
      lineHeight: 28,
      fontWeight: "900",
      color: theme.colors.text
    },
    lessonTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    lessonMeta: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    lessonDate: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    lessonUrl: {
      fontSize: theme.typography.body,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: "auto"
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    }
  });
}
