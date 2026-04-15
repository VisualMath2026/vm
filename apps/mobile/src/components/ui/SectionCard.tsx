import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { fixText } from "../../utils/fixText";
import type { AppTheme } from "../../theme";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  theme: AppTheme;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function SectionCard({
  title,
  subtitle,
  theme,
  children,
  style
}: SectionCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, style]}>
      {title || subtitle ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{fixText(title)}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{fixText(subtitle)}</Text> : null}
        </View>
      ) : null}

      <View>{children}</View>
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
    header: {
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
      lineHeight: 18
    }
  });
}