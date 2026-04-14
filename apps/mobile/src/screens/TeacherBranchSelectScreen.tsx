import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

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
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  const sortedBranches = [...branches].sort((left, right) =>
    left.teacherName.localeCompare(right.teacherName, "ru")
  );

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Выбор преподавателя"
        subtitle="Выбери преподавателя и открой его курс, материалы, встречи и домашние задания."
        rightSlot={
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>{sortedBranches.length} веток</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Classroom</Text>
        <Text style={styles.heroTitle}>Подключись к нужному преподавателю</Text>
        <Text style={styles.heroSubtitle}>
          После выбора откроется учебная ветка преподавателя с персональным каталогом лекций и материалов.
        </Text>
      </View>

      <SectionCard
        theme={theme}
        title="Доступные преподаватели"
        subtitle={
          sortedBranches.length > 0
            ? "Нажми на карточку и продолжи."
            : "Пока нет доступных преподавательских веток."
        }
      >
        {sortedBranches.length === 0 ? (
          <Text style={styles.emptyText}>Пока ни один преподаватель не создал свою ветку.</Text>
        ) : (
          <View style={styles.branchList}>
            {sortedBranches.map((branch) => {
              const isActive = branch.teacherLogin === selectedTeacherLogin;

              return (
                <Pressable
                  key={branch.teacherLogin}
                  onPress={() => onSelectTeacher(branch.teacherLogin)}
                  style={[
                    styles.branchCard,
                    isActive ? styles.branchCardActive : null
                  ]}
                >
                  <View style={styles.branchTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getTeacherInitials(branch.teacherName)}
                      </Text>
                    </View>

                    <View style={styles.branchTextWrap}>
                      <Text style={styles.branchTitle}>{fixText(branch.title)}</Text>
                      <Text style={styles.branchMeta}>{fixText(branch.teacherName)}</Text>
                      <Text style={styles.branchMeta}>Логин: {fixText(branch.teacherLogin)}</Text>
                    </View>

                    <View style={isActive ? styles.statusActive : styles.statusIdle}>
                      <Text style={isActive ? styles.statusActiveText : styles.statusIdleText}>
                        {isActive ? "Выбрано" : "Выбрать"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.branchDescription}>{fixText(branch.description)}</Text>
                </Pressable>
              );
            })}
          </View>
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

function getTeacherInitials(value: string): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "П";
  }

  return parts.map((item) => item[0]?.toUpperCase() ?? "").join("");
}

function createStyles(theme: AppTheme, width: number) {
  const isPhone = width < 520;

  return StyleSheet.create({
    headerChip: {
      alignSelf: "flex-start",
      minHeight: 34,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    heroCard: {
      borderRadius: theme.radius.lg,
      padding: isPhone ? theme.spacing.lg : theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.md
    },
    heroEyebrow: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textTransform: "uppercase"
    },
    heroTitle: {
      fontSize: isPhone ? 24 : theme.typography.title,
      lineHeight: isPhone ? 30 : theme.typography.title + 4,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    branchList: {
      width: "100%"
    },
    branchCard: {
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: isPhone ? theme.spacing.md : theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    branchCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    branchTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm
    },
    avatar: {
      width: isPhone ? 42 : 48,
      height: isPhone ? 42 : 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginRight: theme.spacing.md
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: theme.typography.body,
      fontWeight: "900"
    },
    branchTextWrap: {
      flex: 1,
      paddingRight: theme.spacing.sm
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
      marginBottom: 2
    },
    statusActive: {
      minHeight: 30,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary
    },
    statusIdle: {
      minHeight: 30,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    statusActiveText: {
      color: "#FFFFFF",
      fontSize: theme.typography.caption,
      fontWeight: "800"
    },
    statusIdleText: {
      color: theme.colors.text,
      fontSize: theme.typography.caption,
      fontWeight: "800"
    },
    branchDescription: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    actionTop: {
      marginTop: theme.spacing.sm
    }
  });
}
