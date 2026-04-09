import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { fixText } from "../../utils/fixText";

import type { AppTheme } from "../../theme";

type ScreenHeaderProps = {
  theme: AppTheme;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function ScreenHeader({
  theme,
  title,
  subtitle,
  rightSlot
}: ScreenHeaderProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.wrapper}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{fixText(title)}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle ? fixText(subtitle) : subtitle}</Text> : null}
      </View>

      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.lg
    },
    textBlock: {
      marginBottom: theme.spacing.sm
    },
    title: {
      fontSize: theme.typography.screenTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    rightSlot: {
      marginTop: theme.spacing.sm
    }
  });
}