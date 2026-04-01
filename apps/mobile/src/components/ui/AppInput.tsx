import React from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View
} from "react-native";

import type { AppTheme } from "../../theme";

type AppInputProps = TextInputProps & {
  label: string;
  theme: AppTheme;
  error?: string;
};

export function AppInput({
  label,
  theme,
  error,
  ...props
}: AppInputProps) {
  const styles = createStyles(theme, Boolean(error));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        style={styles.input}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(theme: AppTheme, hasError: boolean) {
  return StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: theme.spacing.md
    },
    label: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      fontWeight: "600"
    },
    input: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: hasError ? theme.colors.danger : theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body
    },
    error: {
      marginTop: theme.spacing.xs,
      color: theme.colors.danger,
      fontSize: theme.typography.caption
    }
  });
}
