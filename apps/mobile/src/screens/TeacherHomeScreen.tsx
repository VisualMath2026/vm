import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { LectureItem } from "../mocks/lectures";
import type { UserProfile } from "../mocks/user";
import type { AppTheme } from "../theme";

type TeacherHomeScreenProps = {
  theme: AppTheme;
  user: UserProfile;
  lectures: LectureItem[];
  onOpenManageSession: (lecture: LectureItem) => void;
};

export function TeacherHomeScreen({
  theme,
  user,
  lectures,
  onOpenManageSession
}: TeacherHomeScreenProps) {
  const styles = createStyles(theme);

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Кабинет преподавателя</Text>
      <Text style={styles.subtitle}>
        Управление лекциями и учебными сессиями в mock-режиме.
      </Text>

      <SectionCard
        title={user.fullName}
        subtitle="Текущий преподаватель"
        theme={theme}
      >
        <Text style={styles.metaText}>Логин: {user.login}</Text>
        <Text style={styles.metaText}>Роль: преподаватель</Text>
        <Text style={styles.metaText}>Группа: {user.group}</Text>
      </SectionCard>

      <SectionCard
        title="Доступные лекции"
        subtitle="Из этих лекций можно запускать demo-сессию"
        theme={theme}
      >
        {lectures.map((lecture) => (
          <View key={lecture.id} style={styles.lectureCard}>
            <Text style={styles.lectureTitle}>{lecture.title}</Text>
            <Text style={styles.lectureMeta}>
              {lecture.subject} • {lecture.semester} • {lecture.level}
            </Text>
            <View style={styles.actionTop}>
              <AppButton
                label="Управлять сессией"
                onPress={() => onOpenManageSession(lecture)}
                theme={theme}
              />
            </View>
          </View>
        ))}
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
    lectureCard: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    lectureTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    lectureMeta: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    actionTop: {
      marginTop: theme.spacing.md
    }
  });
}