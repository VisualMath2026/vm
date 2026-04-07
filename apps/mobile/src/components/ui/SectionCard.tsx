import React from "react";

import { StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../theme";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  theme: AppTheme;
  children?: React.ReactNode;
};

export function SectionCard({
  title,
  subtitle,
  theme,
  children
}: SectionCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md
    },
    title: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    }
  });
}
