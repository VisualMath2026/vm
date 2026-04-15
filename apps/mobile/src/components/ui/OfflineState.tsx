import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "./AppButton";
import type { AppTheme } from "../../theme";

type OfflineStateProps = {
  theme: AppTheme;
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function OfflineState({
  theme,
  title = "Нет подключения к сети",
  description = "Показаны последние доступные данные. Проверь интернет и попробуй снова.",
  onRetry
}: OfflineStateProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry ? (
        <AppButton
          label="Повторить"
          onPress={onRetry}
          theme={theme}
          variant="secondary"
        />
      ) : null}
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
      textAlign: "center",
      marginBottom: theme.spacing.md
    }
  });
}
