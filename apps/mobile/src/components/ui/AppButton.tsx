import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle
} from "react-native";

import type { AppTheme } from "../../theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  theme,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  style
}: AppButtonProps) {
  const styles = createStyles(theme, variant, disabled, fullWidth);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(
  theme: AppTheme,
  variant: ButtonVariant,
  disabled: boolean,
  fullWidth: boolean
) {
  const backgroundColor =
    variant === "primary"
      ? theme.colors.primary
      : variant === "secondary"
        ? theme.colors.surface
        : "transparent";

  const textColor =
    variant === "primary" ? "#FFFFFF" : theme.colors.text;

  return StyleSheet.create({
    button: {
      width: fullWidth ? "100%" : undefined,
      minHeight: 52,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor,
      borderWidth: variant === "ghost" ? 0 : 1,
      borderColor:
        variant === "primary" ? theme.colors.primary : theme.colors.border,
      opacity: disabled ? 0.6 : 1
    },
    label: {
      color: textColor,
      fontSize: theme.typography.body,
      fontWeight: "700"
    }
  });
}
