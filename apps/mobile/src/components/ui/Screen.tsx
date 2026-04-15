import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions
} from "react-native";

import type { AppTheme } from "../../theme";

type ScreenProps = {
  children: React.ReactNode;
  theme: AppTheme;
  scrollable?: boolean;
};

export function Screen({
  children,
  theme,
  scrollable = true
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <View style={styles.inner}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme, width: number) {
  const isPhone = width < 560;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    keyboardContainer: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isPhone ? theme.spacing.md : theme.spacing.lg,
      paddingVertical: theme.spacing.lg
    },
    content: {
      flex: 1,
      paddingHorizontal: isPhone ? theme.spacing.md : theme.spacing.lg,
      paddingVertical: theme.spacing.lg
    },
    inner: {
      width: "100%",
      maxWidth: 1120,
      alignSelf: "center"
    }
  });
}