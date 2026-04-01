import React, { useMemo, useState } from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";

type CatalogScreenProps = {
  theme: AppTheme;
  lectures: LectureItem[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
};

export function CatalogScreen({
  theme,
  lectures,
  isLoading = false,
  hasError = false,
  onRetry
}: CatalogScreenProps) {
  const styles = createStyles(theme);
  const [query, setQuery] = useState("");

  const filteredLectures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return lectures;
    }

    return lectures.filter((lecture) => {
      const haystack = [
        lecture.title,
        lecture.author,
        lecture.subject,
        lecture.level,
        ...lecture.tags
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [lectures, query]);

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Каталог лекций</Text>
      <Text style={styles.subtitle}>
        Поиск и просмотр доступных материалов для VM Mobile.
      </Text>

      <SectionCard
        title="Поиск"
        subtitle="Подготовка экрана каталога под требования ТЗ."
        theme={theme}
      >
        <AppInput
          label="Найти лекцию"
          value={query}
          onChangeText={setQuery}
          placeholder="Название, тег, автор..."
          theme={theme}
        />
      </SectionCard>

      <SectionCard
        title="Сводка"
        subtitle="Текущий локальный набор данных"
        theme={theme}
      >
        <Text style={styles.metaText}>Всего лекций: {lectures.length}</Text>
        <Text style={styles.metaText}>Найдено по запросу: {filteredLectures.length}</Text>
      </SectionCard>

      {isLoading ? <LoadingState theme={theme} text="Загружаем каталог..." /> : null}

      {!isLoading && hasError ? (
        <ErrorState
          theme={theme}
          description="Каталог пока не удалось получить. Попробуй повторить загрузку."
          onRetry={onRetry}
        />
      ) : null}

      {!isLoading && !hasError && filteredLectures.length === 0 ? (
        <View>
          <EmptyState
            theme={theme}
            title="Ничего не найдено"
            description="Попробуй изменить поисковый запрос."
          />
          <View style={styles.resetButton}>
            <AppButton
              label="Сбросить поиск"
              onPress={() => setQuery("")}
              theme={theme}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}

      {!isLoading && !hasError && filteredLectures.length > 0
        ? filteredLectures.map((lecture) => (
            <SectionCard
              key={lecture.id}
              title={lecture.title}
              subtitle={`${lecture.subject} • ${lecture.semester} • ${lecture.level}`}
              theme={theme}
            >
              <Text style={styles.description}>{lecture.description}</Text>
              <Text style={styles.metaText}>Автор: {lecture.author}</Text>
              <Text style={styles.tags}>Теги: {lecture.tags.join(", ")}</Text>
            </SectionCard>
          ))
        : null}
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
    description: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    tags: {
      fontSize: theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: "600"
    },
    resetButton: {
      marginTop: theme.spacing.md
    }
  });
}
