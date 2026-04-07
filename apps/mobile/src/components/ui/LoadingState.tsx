import React from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../theme";

type LoadingStateProps = {
  theme: AppTheme;
  text?: string;
};

export function LoadingState({
  theme,
  text = "Загрузка..."
}: LoadingStateProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.xl,
      alignItems: "center",
      justifyContent: "center"
    },
    text: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body
    }
  });
}
