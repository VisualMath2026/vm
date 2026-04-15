import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

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

function createStyles(theme: AppTheme, width: number) {
  const isPhone = width < 560;
  const isCompact = width < 820;

  return StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.lg
    },
    row: {
      flexDirection: isCompact ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isCompact ? "stretch" : "flex-start",
      gap: theme.spacing.md
    },
    textBlock: {
      flex: 1,
      maxWidth: 760
    },
    title: {
      fontSize: isPhone ? 22 : theme.typography.screenTitle,
      lineHeight: isPhone ? 28 : theme.typography.screenTitle + 4,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    rightSlot: {
      alignSelf: isCompact ? "flex-start" : "auto"
    }
  });
}