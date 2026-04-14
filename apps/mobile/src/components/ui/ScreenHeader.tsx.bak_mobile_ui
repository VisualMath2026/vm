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
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{fixText(title)}</Text>
          {subtitle ? <Text style={styles.subtitle}>{fixText(subtitle)}</Text> : null}
        </View>

        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.xl
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.md
    },
    textBlock: {
      flex: 1,
      maxWidth: 860
    },
    title: {
      fontSize: theme.typography.screenTitle,
      lineHeight: theme.typography.screenTitle + 6,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      letterSpacing: -0.3
    },
    subtitle: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary
    },
    rightSlot: {
      marginTop: theme.spacing.xs
    }
  });
}
