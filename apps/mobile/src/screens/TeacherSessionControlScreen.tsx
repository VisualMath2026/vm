import React, { useMemo } from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import {
  countTeacherParticipantStatuses,
  getTeacherCurrentBlock,
  type TeacherManagedSession
} from "../mocks/teacher";
import type { AppTheme } from "../theme";

type TeacherSessionControlScreenProps = {
  theme: AppTheme;
  session: TeacherManagedSession;
  onBack: () => void;
  onStart: () => void;
  onStop: () => void;
  onPrevBlock: () => void;
  onNextBlock: () => void;
};

export function TeacherSessionControlScreen({
  theme,
  session,
  onBack,
  onStart,
  onStop,
  onPrevBlock,
  onNextBlock
}: TeacherSessionControlScreenProps) {
  const styles = createStyles(theme);

  const stats = useMemo(
    () => countTeacherParticipantStatuses(session),
    [session]
  );

  const currentBlock = getTeacherCurrentBlock(session);

  return (
    <Screen theme={theme}>
      <View style={styles.headerActions}>
        <AppButton
          label="Назад в кабинет"
          onPress={onBack}
          theme={theme}
          variant="secondary"
        />
      </View>

      <Text style={styles.title}>Управление сессией</Text>
      <Text style={styles.subtitle}>{session.lectureTitle}</Text>

      <SectionCard
        title="Состояние сессии"
        subtitle={`Код сессии: ${session.sessionCode}`}
        theme={theme}
      >
        <Text style={styles.metaText}>Статус: {session.status}</Text>
        <Text style={styles.metaText}>Текущий блок: {currentBlock}</Text>
        <Text style={styles.metaText}>
          Позиция блока: {session.currentBlockIndex + 1} / {session.blocks.length}
        </Text>
      </SectionCard>

      <SectionCard
        title="Управление"
        subtitle="Mock-кнопки преподавателя"
        theme={theme}
      >
        <View style={styles.actionGroup}>
          <AppButton
            label="Запустить сессию"
            onPress={onStart}
            theme={theme}
            disabled={session.status === "active"}
          />
        </View>

        <View style={styles.actionGroup}>
          <AppButton
            label="Остановить сессию"
            onPress={onStop}
            theme={theme}
            variant="secondary"
            disabled={session.status === "stopped"}
          />
        </View>

        <View style={styles.doubleActionRow}>
          <View style={styles.doubleActionItem}>
            <AppButton
              label="Предыдущий блок"
              onPress={onPrevBlock}
              theme={theme}
              variant="secondary"
              disabled={session.currentBlockIndex === 0}
            />
          </View>
          <View style={styles.doubleActionItem}>
            <AppButton
              label="Следующий блок"
              onPress={onNextBlock}
              theme={theme}
              disabled={session.currentBlockIndex === session.blocks.length - 1}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Сводка по студентам"
        subtitle="Быстрый обзор состояния аудитории"
        theme={theme}
      >
        <Text style={styles.metaText}>В сети: {stats.online}</Text>
        <Text style={styles.metaText}>В процессе: {stats.inProgress}</Text>
        <Text style={styles.metaText}>Завершили: {stats.completed}</Text>
        <Text style={styles.metaText}>Не в сети: {stats.offline}</Text>
      </SectionCard>

      <SectionCard
        title="Список участников"
        subtitle="Mock-статусы выполнения"
        theme={theme}
      >
        {session.participants.map((participant) => (
          <View key={participant.id} style={styles.participantRow}>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <Text style={styles.participantMeta}>
                Статус: {participant.status}
              </Text>
            </View>
            <Text style={styles.participantScore}>
              {participant.score === null ? "—" : `${participant.score} б.`}
            </Text>
          </View>
        ))}
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
    metaText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    actionGroup: {
      marginBottom: theme.spacing.md
    },
    doubleActionRow: {
      flexDirection: "row",
      gap: theme.spacing.sm
    },
    doubleActionItem: {
      flex: 1
    },
    participantRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    participantInfo: {
      flex: 1,
      paddingRight: theme.spacing.md
    },
    participantName: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    participantMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    },
    participantScore: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.primary
    }
  });
}