import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusPill } from "../ui/StatusPill";
import type { AppTheme } from "../../theme";

type VisualModuleFallbackProps = {
  theme: AppTheme;
  title?: string;
  description?: string;
  compact?: boolean;
};

export function VisualModuleFallback({
  theme,
  title = "Контейнер визуального модуля",
  description = "Здесь позже подключается VM Graphics. Пока показываем безопасный fallback, чтобы экран не ломался без WebGL или WebView.",
  compact = false
}: VisualModuleFallbackProps) {
  const styles = createStyles(theme, compact);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <StatusPill theme={theme} label="Fallback" tone="warning" />
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.previewCanvas}>
        <View style={styles.axisHorizontal} />
        <View style={styles.axisVertical} />

        <View style={[styles.previewPoint, styles.pointA]} />
        <View style={[styles.previewPoint, styles.pointB]} />
        <View style={[styles.previewPoint, styles.pointC]} />

        <View style={styles.curveOne} />
        <View style={styles.curveTwo} />
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme, compact: boolean) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: compact ? theme.spacing.sm : theme.spacing.md
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    title: {
      flex: 1,
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text
    },
    description: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    previewCanvas: {
      height: compact ? 160 : 220,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      overflow: "hidden",
      position: "relative"
    },
    axisHorizontal: {
      position: "absolute",
      left: 16,
      right: 16,
      top: "50%",
      height: 2,
      backgroundColor: theme.colors.border
    },
    axisVertical: {
      position: "absolute",
      top: 16,
      bottom: 16,
      left: "22%",
      width: 2,
      backgroundColor: theme.colors.border
    },
    previewPoint: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.primary
    },
    pointA: {
      left: "30%",
      top: "38%"
    },
    pointB: {
      left: "52%",
      top: "24%"
    },
    pointC: {
      left: "72%",
      top: "58%"
    },
    curveOne: {
      position: "absolute",
      left: "24%",
      right: "18%",
      top: "34%",
      height: 2,
      backgroundColor: theme.colors.primary,
      transform: [{ rotate: "-12deg" }]
    },
    curveTwo: {
      position: "absolute",
      left: "45%",
      right: "16%",
      top: "43%",
      height: 2,
      backgroundColor: theme.colors.success,
      transform: [{ rotate: "18deg" }]
    }
  });
}
