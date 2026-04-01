import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { SessionData } from "../mocks/session";
import type { AppTheme } from "../theme";

type SessionScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  session: SessionData;
  onBack: () => void;
  onOpenTask: () => void;
};

export function SessionScreen({
  theme,
  lecture,
  session,
  onBack,
  onOpenTask
}: SessionScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <View style={styles.headerActions}>
        <AppButton
          label="Назад к лекции"
          onPress={onBack}
          theme={theme}
          variant="secondary"
        />
      </View>

      <Text style={styles.title}>Сессия занятия</Text>
      <Text style={styles.subtitle}>{lecture.title}</Text>

      <SectionCard
        title="Состояние сессии"
        subtitle={`Код подключения: ${session.sessionCode}`}
        theme={theme}
      >
        <Text style={styles.metaText}>Статус: {session.status}</Text>
        <Text style={styles.metaText}>Подключение: {session.connectionStatus}</Text>
        <Text style={styles.metaText}>Участников: {session.participantsCount}</Text>
        <Text style={styles.metaText}>Текущий блок: {session.currentBlockTitle}</Text>
      </SectionCard>

      <SectionCard
        title="Состав лекции"
        subtitle="Блоки текущего занятия"
        theme={theme}
      >
        {lecture.blocks.map((block, index) => (
          <Text key={block} style={styles.listItem}>
            {index + 1}. {block}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        title="Проверочный блок"
        subtitle="Локальный сценарий без сервера"
        theme={theme}
      >
        <Text style={styles.bodyText}>{session.question.prompt}</Text>

        <View style={styles.actionTop}>
          <AppButton
            label="Открыть задание"
            onPress={onOpenTask}
            theme={theme}
          />
        </View>
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
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    actionTop: {
      marginTop: theme.spacing.md
    }
  });
}