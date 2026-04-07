import React, { useMemo, useState } from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { OfflineState } from "../components/ui/OfflineState";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";
import { fixText, fixTextList } from "../utils/fixText";

type CatalogScreenProps = {
  theme: AppTheme;
  lectures: LectureItem[];
  lastOpenedLecture?: LectureItem | null;
  isLoading?: boolean;
  hasError?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  onOpenLecture: (lecture: LectureItem) => void;
};

export function CatalogScreen({
  theme,
  lectures,
  lastOpenedLecture = null,
  isLoading = false,
  hasError = false,
  isOffline = false,
  onRetry,
  onOpenLecture
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
      <ScreenHeader
        theme={theme}
        title="Каталог лекций"
        subtitle="Поиск, повторное открытие лекций и локальный offline-кэш."
      />

      {lastOpenedLecture ? (
        <SectionCard
          title="Последняя открытая лекция"
          subtitle={`${lastOpenedLecture.subject} • ${lastOpenedLecture.semester}`}
          theme={theme}
        >
          <Text style={styles.description}>{lastOpenedLecture.title}</Text>

          <View style={styles.metaRow}>
            <StatusPill
              theme={theme}
              label={`Длительность: ${(lastOpenedLecture.id.startsWith("draft-lecture-") ? "15 минут" : lastOpenedLecture.estimatedDuration)}`}
              tone="info"
            />
          </View>

          <View style={styles.cardAction}>
            <AppButton
              label="Открыть снова"
              onPress={() => onOpenLecture(lastOpenedLecture)}
              theme={theme}
              variant="secondary"
            />
          </View>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Поиск"
        subtitle="По названию, тегам, предмету или автору"
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
        title="Состояние данных"
        subtitle="Быстрый обзор текущего режима"
        theme={theme}
      >
        <View style={styles.metaRow}>
          <StatusPill
            theme={theme}
            label={`Всего лекций: ${lectures.length}`}
            tone="neutral"
          />
          <StatusPill
            theme={theme}
            label={`Найдено: ${filteredLectures.length}`}
            tone="info"
          />
          <StatusPill
            theme={theme}
            label={
              isLoading
                ? "loading"
                : hasError
                  ? "error"
                  : isOffline
                    ? "offline"
                    : "online"
            }
            tone={
              isLoading
                ? "warning"
                : hasError
                  ? "danger"
                  : isOffline
                    ? "warning"
                    : "success"
            }
          />
        </View>
      </SectionCard>

      {isOffline ? (
        <View style={styles.infoBlock}>
          <OfflineState
            theme={theme}
            description="Сейчас отображается сохранённый кэш каталога. Можно продолжить просмотр лекций."
            onRetry={onRetry}
          />
        </View>
      ) : null}

      {isLoading ? (
        <SectionCard
          title="Загрузка каталога"
          subtitle="Имитация получения данных"
          theme={theme}
        >
          <LoadingState theme={theme} text="Обновляем список лекций..." />
        </SectionCard>
      ) : null}

      {!isLoading && hasError ? (
        <ErrorState
          theme={theme}
          title="Не удалось обновить каталог"
          description="Локальные данные можно оставить, а состояние вернуть кнопкой «Повторить»."
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
              <Text style={styles.description}>{fixText(lecture.description)}</Text>

              <View style={styles.metaRow}>
                <StatusPill
                  theme={theme}
                  label={lecture.id.startsWith("draft-lecture-") ? "Visual Math Team" : lecture.author}
                  tone="neutral"
                />
                <StatusPill
                  theme={theme}
                  label={fixText((lecture.id.startsWith("draft-lecture-") ? "15 минут" : lecture.estimatedDuration))}
                  tone="info"
                />
              </View>

              <Text style={styles.tags}>Теги: {lecture.tags.join(", ")}</Text>

              <View style={styles.cardAction}>
                <AppButton
                  label="Открыть лекцию"
                  onPress={() => onOpenLecture(lecture)}
                  theme={theme}
                />
              </View>
            </SectionCard>
          ))
        : null}
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    description: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    tags: {
      fontSize: theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: "600",
      marginTop: theme.spacing.xs
    },
    resetButton: {
      marginTop: theme.spacing.md
    },
    infoBlock: {
      marginBottom: theme.spacing.md
    },
    cardAction: {
      marginTop: theme.spacing.md
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    }
  });
}