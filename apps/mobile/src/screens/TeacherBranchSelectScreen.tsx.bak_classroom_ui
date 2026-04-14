import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { TeacherBranch } from "../storage/teacherBranchesStorage";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

type TeacherBranchSelectScreenProps = {
  theme: AppTheme;
  branches: TeacherBranch[];
  selectedTeacherLogin: string | null;
  onSelectTeacher: (teacherLogin: string) => void;
  onContinue: () => void;
};

export function TeacherBranchSelectScreen({
  theme,
  branches,
  selectedTeacherLogin,
  onSelectTeacher,
  onContinue
}: TeacherBranchSelectScreenProps) {
  const styles = createStyles(theme);

  const sortedBranches = [...branches].sort((left, right) =>
    left.teacherName.localeCompare(right.teacherName, "ru")
  );

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Выбор преподавателя"
        subtitle="Сначала выбери преподавателя, затем откроется его ветка с лекциями, заданиями и материалами."
      />

      <SectionCard
        theme={theme}
        title="Доступные преподаватели"
        subtitle={sortedBranches.length > 0 ? `Всего веток: ${sortedBranches.length}` : "Пока нет доступных веток"}
      >
        {sortedBranches.length === 0 ? (
          <Text style={styles.emptyText}>Пока ни один преподаватель не создал свою ветку.</Text>
        ) : (
          sortedBranches.map((branch) => {
            const isActive = branch.teacherLogin === selectedTeacherLogin;

            return (
              <Pressable
                key={branch.teacherLogin}
                onPress={() => onSelectTeacher(branch.teacherLogin)}
                style={[
                  styles.branchCard,
                  {
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface
                  }
                ]}
              >
                <Text style={styles.branchTitle}>{fixText(branch.title)}</Text>
                <Text style={styles.branchMeta}>{fixText(branch.teacherName)}</Text>
                <Text style={styles.branchMeta}>Логин: {fixText(branch.teacherLogin)}</Text>
                <Text style={styles.branchDescription}>{fixText(branch.description)}</Text>
              </Pressable>
            );
          })
        )}

        <View style={styles.actionTop}>
          <AppButton
            label="Открыть ветку преподавателя"
            onPress={onContinue}
            theme={theme}
            disabled={!selectedTeacherLogin}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    branchCard: {
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md
    },
    branchTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    branchMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    branchDescription: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs
    },
    actionTop: {
      marginTop: theme.spacing.sm
    }
  });
}
