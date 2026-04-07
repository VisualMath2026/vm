import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import { getTeacherCurrentBlock, type TeacherManagedSession } from "../mocks/teacher";
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
  const currentBlock = getTeacherCurrentBlock(session);

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Управление сессией</Text>
      <Text style={styles.subtitle}>{session.lectureTitle}</Text>

      <SectionCard
        title="Состояние сессии"
        subtitle="Только основные параметры без fake-участников"
        theme={theme}
      >
        <Text style={styles.metaText}>Код сессии: {session.sessionCode}</Text>
        <Text style={styles.metaText}>Статус: {session.status}</Text>
        <Text style={styles.metaText}>Текущий блок: {currentBlock}</Text>
        <Text style={styles.metaText}>
          Позиция блока: {session.currentBlockIndex + 1} / {session.blocks.length}
        </Text>
      </SectionCard>

      <SectionCard
        title="Управление"
        subtitle="Mock-кнопки переключения"
        theme={theme}
      >
        <View style={styles.actionGroup}>
          <AppButton label="Запустить сессию" onPress={onStart} theme={theme} />
        </View>

        <View style={styles.actionGroup}>
          <AppButton label="Остановить сессию" onPress={onStop} theme={theme} variant="secondary" />
        </View>

        <View style={styles.doubleActionRow}>
          <View style={styles.doubleActionItem}>
            <AppButton label="Предыдущий блок" onPress={onPrevBlock} theme={theme} variant="secondary" />
          </View>

          <View style={styles.doubleActionItem}>
            <AppButton label="Следующий блок" onPress={onNextBlock} theme={theme} />
          </View>
        </View>

        <View style={styles.actionGroup}>
          <AppButton label="Назад" onPress={onBack} theme={theme} variant="secondary" />
        </View>
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
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md
    },
    doubleActionItem: {
      flex: 1
    }
  });
}
