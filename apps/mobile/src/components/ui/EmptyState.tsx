import React from "react";

import { StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../theme";

type EmptyStateProps = {
  theme: AppTheme;
  title: string;
  description: string;
};

export function EmptyState({
  theme,
  title,
  description
}: EmptyStateProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.xl,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      marginBottom: theme.spacing.xs,
      textAlign: "center"
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body,
      textAlign: "center"
    }
  });
}
