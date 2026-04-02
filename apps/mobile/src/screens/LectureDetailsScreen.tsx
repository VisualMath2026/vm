import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";

type LectureDetailsScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  onBack: () => void;
  onOpenSession: () => void;
};

export function LectureDetailsScreen({
  theme,
  lecture,
  onBack,
  onOpenSession
}: LectureDetailsScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title={lecture.title}
        subtitle={`${lecture.subject} • ${lecture.semester} • ${lecture.level}`}
        rightSlot={
          <AppButton
            label="Назад в каталог"
            onPress={onBack}
            theme={theme}
            variant="secondary"
          />
        }
      />

      <View style={styles.metaRow}>
        <StatusPill theme={theme} label={lecture.author} tone="neutral" />
        <StatusPill
          theme={theme}
          label={lecture.estimatedDuration}
          tone="info"
        />
      </View>

      <SectionCard
        title="Описание лекции"
        subtitle="Краткое содержание"
        theme={theme}
      >
        <Text style={styles.bodyText}>{lecture.description}</Text>
      </SectionCard>

      <SectionCard
        title="Состав блоков"
        subtitle="Что входит в лекцию"
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
        subtitle="Что желательно знать заранее"
        theme={theme}
      >
        {lecture.participationRequirements.map((item, index) => (
          <Text key={`${lecture.id}-${index}`} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard
        title="Следующий шаг"
        subtitle="Локальный demo-flow"
        theme={theme}
      >
        <Text style={styles.bodyText}>
          Можно перейти к сессии, открыть задание и пройти проверочный блок.
        </Text>

        <View style={styles.actionTop}>
          <AppButton
            label="Перейти к сессии"
            onPress={onOpenSession}
            theme={theme}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text
    },
    listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    actionTop: {
      marginTop: theme.spacing.md
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    }
  });
}