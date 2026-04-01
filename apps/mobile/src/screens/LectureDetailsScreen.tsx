import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";

type LectureDetailsScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  onBack: () => void;
};

export function LectureDetailsScreen({
  theme,
  lecture,
  onBack
}: LectureDetailsScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <View style={styles.headerActions}>
        <AppButton
          label="Назад в каталог"
          onPress={onBack}
          theme={theme}
          variant="secondary"
        />
      </View>

      <Text style={styles.title}>{lecture.title}</Text>
      <Text style={styles.subtitle}>
        {lecture.subject} • {lecture.semester} • {lecture.level}
      </Text>

      <SectionCard
        title="Описание лекции"
        subtitle={`Автор: ${lecture.author}`}
        theme={theme}
      >
        <Text style={styles.bodyText}>{lecture.description}</Text>
      </SectionCard>

      <SectionCard
        title="Состав блоков"
        subtitle={`Оценочная длительность: ${lecture.estimatedDuration}`}
        theme={theme}
      >
        {lecture.blocks.map((block, index) => (
          <Text key={block} style={styles.listItem}>
            {index + 1}. {block}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        title="Требования к участию"
        subtitle="Подготовка перед началом занятия"
        theme={theme}
      >
        {lecture.participationRequirements.map((item, index) => (
          <Text key={`${lecture.id}-${index}`} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        title="Статус интеграции"
        subtitle="Пока это локальная версия без реального API"
        theme={theme}
      >
        <Text style={styles.bodyText}>
          Следующий шаг после этого экрана — экран сессии и экран заданий.
        </Text>
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerActions: {
      marginBottom: theme.spacing.md
    },
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
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text
    },
    listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    }
  });
}
