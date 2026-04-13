import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";

type CatalogScreenProps = {
  theme: AppTheme;
  lectures: LectureItem[];
  lastOpenedLecture: LectureItem | null;
  isLoading: boolean;
  hasError: boolean;
  isOffline: boolean;
  onRetry: () => void;
  onOpenLecture: (lecture: LectureItem) => void;
};

export function CatalogScreen({
  theme,
  lectures,
  lastOpenedLecture,
  isLoading,
  hasError,
  isOffline,
  onRetry,
  onOpenLecture
}: CatalogScreenProps) {
  const styles = createStyles(theme);
  const [query, setQuery] = useState("");

  const filteredLectures = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return lectures;
    }

    return lectures.filter((lecture) => {
      const haystack = [
        lecture.title,
        lecture.author,
        lecture.subject,
        lecture.semester,
        lecture.level,
        lecture.description,
        ...(lecture.tags ?? [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [lectures, query]);

  const totalBlocks = useMemo(
    () => lectures.reduce((sum, lecture) => sum + lecture.blocks.length, 0),
    [lectures]
  );

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Каталог лекций"
        subtitle="Выбирай лекции, открывай материалы и продолжай работу с последнего места."
        rightSlot={
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{lectures.length} лекций</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Библиотека VisualMath</Text>
          <Text style={styles.heroTitle}>
            {lastOpenedLecture
              ? `Продолжить: ${lastOpenedLecture.title}`
              : "Подбери лекцию и начни обучение"}
          </Text>
          <Text style={styles.heroText}>
            {lastOpenedLecture
              ? `Последняя открытая лекция уже готова к продолжению. Также можно быстро найти нужный курс по названию, предмету или автору.`
              : `Здесь собраны лекции, визуальные модули, задания и материалы для студентов и преподавателей.`}
          </Text>

          <View style={styles.heroActions}>
            {lastOpenedLecture ? (
              <AppButton
                label="Открыть последнюю лекцию"
                onPress={() => onOpenLecture(lastOpenedLecture)}
                theme={theme}
                fullWidth={false}
                style={styles.heroButton}
              />
            ) : null}

            <AppButton
              label="Обновить каталог"
              onPress={onRetry}
              theme={theme}
              variant="secondary"
              fullWidth={false}
              style={styles.heroButton}
            />
          </View>
        </View>

        <View style={styles.statsColumn}>
          <StatCard theme={theme} value={String(lectures.length)} label="Лекций" />
          <StatCard theme={theme} value={String(totalBlocks)} label="Блоков" />
          <StatCard
            theme={theme}
            value={isOffline ? "offline" : "online"}
            label="Режим"
          />
        </View>
      </View>

      {isOffline ? (
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerInfoTitle}>Оффлайн-режим</Text>
          <Text style={styles.bannerInfoText}>
            Показаны сохранённые данные. Некоторые материалы могут быть не самыми свежими.
          </Text>
        </View>
      ) : null}

      {hasError ? (
        <View style={styles.bannerError}>
          <View style={styles.bannerErrorTextWrap}>
            <Text style={styles.bannerErrorTitle}>Не удалось обновить каталог</Text>
            <Text style={styles.bannerErrorText}>
              Проверь соединение и попробуй повторить загрузку.
            </Text>
          </View>

          <AppButton
            label="Повторить"
            onPress={onRetry}
            theme={theme}
            variant="secondary"
            fullWidth={false}
          />
        </View>
      ) : null}

      <SectionCard
        title="Поиск по каталогу"
        subtitle="Ищи по названию, предмету, описанию, тегам и автору."
        theme={theme}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Например: Производная, Матанализ, Векторы..."
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.searchInput}
        />

        <View style={styles.searchMetaRow}>
          <Text style={styles.searchMetaText}>
            Найдено: {filteredLectures.length}
          </Text>
          {query.trim() ? (
            <Pressable onPress={() => setQuery("")} style={styles.clearChip}>
              <Text style={styles.clearChipText}>Сбросить</Text>
            </Pressable>
          ) : null}
        </View>
      </SectionCard>

      {isLoading && lectures.length === 0 ? (
        <View style={styles.grid}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMeta} />
              <View style={styles.skeletonMetaShort} />
              <View style={styles.skeletonDescription} />
              <View style={styles.skeletonDescriptionShort} />
            </View>
          ))}
        </View>
      ) : filteredLectures.length === 0 ? (
        <SectionCard
          title="Ничего не найдено"
          subtitle="Попробуй сократить запрос или очистить поиск."
          theme={theme}
        >
          <AppButton
            label="Сбросить поиск"
            onPress={() => setQuery("")}
            theme={theme}
            variant="secondary"
          />
        </SectionCard>
      ) : (
        <View style={styles.grid}>
          {filteredLectures.map((lecture) => {
            const isLastOpened = lastOpenedLecture?.id === lecture.id;

            return (
              <Pressable
                key={lecture.id}
                onPress={() => onOpenLecture(lecture)}
                style={styles.cardPressable}
              >
                <View style={[styles.lectureCard, isLastOpened ? styles.lectureCardHighlighted : null]}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.badgesRow}>
                      <InfoPill theme={theme} text={lecture.subject} tone="primary" />
                      <InfoPill theme={theme} text={lecture.level} tone="neutral" />
                      {isLastOpened ? <InfoPill theme={theme} text="Последняя" tone="success" /> : null}
                    </View>
                  </View>

                  <Text style={styles.lectureTitle}>{lecture.title}</Text>

                  <Text style={styles.lectureMeta}>
                    {lecture.author} • {lecture.semester}
                  </Text>

                  <Text numberOfLines={3} style={styles.lectureDescription}>
                    {lecture.description}
                  </Text>

                  <View style={styles.tagsWrap}>
                    {lecture.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerHint}>
                      {lecture.blocks.length} блока • {lecture.estimatedDuration}
                    </Text>

                    <AppButton
                      label="Открыть"
                      onPress={() => onOpenLecture(lecture)}
                      theme={theme}
                      fullWidth={false}
                      style={styles.openButton}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

type StatCardProps = {
  theme: AppTheme;
  value: string;
  label: string;
};

function StatCard({ theme, value, label }: StatCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type InfoPillProps = {
  theme: AppTheme;
  text: string;
  tone: "primary" | "neutral" | "success";
};

function InfoPill({ theme, text, tone }: InfoPillProps) {
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.infoPill,
        tone === "primary" ? styles.infoPillPrimary : null,
        tone === "neutral" ? styles.infoPillNeutral : null,
        tone === "success" ? styles.infoPillSuccess : null
      ]}
    >
      <Text
        style={[
          styles.infoPillText,
          tone === "primary" ? styles.infoPillTextPrimary : null,
          tone === "success" ? styles.infoPillTextSuccess : null
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerBadge: {
      minHeight: 42,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerBadgeText: {
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
      letterSpacing: 0.4,
      marginBottom: theme.spacing.sm,
      textTransform: "uppercase"
    },
    heroTitle: {
      fontSize: theme.typography.title,
      lineHeight: theme.typography.title + 6,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroText: {
      fontSize: theme.typography.body,
      lineHeight: 26,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      maxWidth: 760
    },
    heroActions: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    heroButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    statsColumn: {
      width: 240,
      minWidth: 220,
      justifyContent: "space-between"
    },
    statCard: {
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
      color: theme.colors.textSecondary,
      fontWeight: "700"
    },
    bannerInfo: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md
    },
    bannerInfoTitle: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    bannerInfoText: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    bannerError: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      marginBottom: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap"
    },
    bannerErrorTextWrap: {
      flex: 1,
      minWidth: 240,
      paddingRight: theme.spacing.md
    },
    bannerErrorTitle: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.danger,
      marginBottom: theme.spacing.xs
    },
    bannerErrorText: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary
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
      marginTop: theme.spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap"
    },
    searchMetaText: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    clearChip: {
      minHeight: 34,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center"
    },
    clearChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    cardPressable: {
      flexBasis: 360,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.md
    },
    lectureCard: {
      height: "100%",
      minHeight: 320,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.md
    },
    lectureCardHighlighted: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceElevated
    },
    cardTopRow: {
      marginBottom: theme.spacing.md
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    infoPill: {
      minHeight: 32,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    infoPillPrimary: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.primary
    },
    infoPillNeutral: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border
    },
    infoPillSuccess: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.success
    },
    infoPillText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    infoPillTextPrimary: {
      color: theme.colors.primary
    },
    infoPillTextSuccess: {
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
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      fontWeight: "700"
    },
    lectureDescription: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    tagsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.lg
    },
    tagChip: {
      minHeight: 30,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      justifyContent: "center",
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    tagChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    cardFooter: {
      marginTop: "auto"
    },
    footerHint: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    openButton: {
      alignSelf: "flex-start"
    },
    skeletonCard: {
      flexBasis: 360,
      flexGrow: 1,
      minHeight: 280,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.md
    },
    skeletonTitle: {
      width: "72%",
      height: 26,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.md
    },
    skeletonMeta: {
      width: "56%",
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.sm
    },
    skeletonMetaShort: {
      width: "34%",
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.lg
    },
    skeletonDescription: {
      width: "100%",
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.sm
    },
    skeletonDescriptionShort: {
      width: "78%",
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceMuted
    }
  });
}
