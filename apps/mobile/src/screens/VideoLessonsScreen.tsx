import React, { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type VideoLessonItem = {
  id: string;
  title: string;
  url: string;
  authorName: string;
  createdAt: string;
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
  const [error, setError] = useState("");

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
      <Text style={styles.title}>Видеоуроки</Text>
      <Text style={styles.subtitle}>Подборка видеоуроков по курсу.</Text>

      {isTeacher ? (
        <SectionCard title="Новый видеоурок" subtitle="Добавьте название и ссылку" theme={theme}>
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
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AppButton
            label="Добавить видеоурок"
            onPress={handleCreate}
            theme={theme}
            style={styles.actionTop}
          />
        </SectionCard>
      ) : null}

      <SectionCard
        title="Список видеоуроков"
        subtitle={lessons.length > 0 ? `Всего уроков: ${lessons.length}` : "Пока уроков нет"}
        theme={theme}
      >
        {lessons.length === 0 ? (
          <Text style={styles.emptyText}>Пока нет добавленных видеоуроков.</Text>
        ) : (
          lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonCard}>
              <Text style={styles.lessonTitle}>{fixText(lesson.title)}</Text>
              <Text style={styles.lessonMeta}>Автор: {fixText(lesson.authorName)}</Text>
              <Text style={styles.lessonUrl}>{lesson.url}</Text>

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
          ))
        )}
      </SectionCard>
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
    actionTop: {
      marginTop: theme.spacing.md
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    lessonCard: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    lessonTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    lessonMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    lessonUrl: {
      fontSize: theme.typography.body,
      color: theme.colors.primary,
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
    }
  });
}