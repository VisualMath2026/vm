import React, { useState } from "react";

import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";

type LoginScreenProps = {
  theme: AppTheme;
  onLogin: (login: string, password: string) => string | null;
};

export function LoginScreen({
  theme,
  onLogin
}: LoginScreenProps) {
  const styles = createStyles(theme);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    setIsSubmitting(true);
    const maybeError = onLogin(login, password);

    if (maybeError) {
      setErrorText(maybeError);
      setIsSubmitting(false);
      return;
    }

    setErrorText("");
    setIsSubmitting(false);
  }

  return (
    <Screen theme={theme}>
      <View style={styles.container}>
        <Text style={styles.logo}>VisualMath</Text>
        <Text style={styles.title}>Вход в VM Mobile</Text>
        <Text style={styles.subtitle}>
          Индивидуальная часть Глеба: базовый экран авторизации и UI-каркас приложения.
        </Text>

        <SectionCard
          title="Авторизация"
          subtitle="Пока это локальная UI-заглушка без реального API."
          theme={theme}
        >
          <AppInput
            label="Логин"
            value={login}
            onChangeText={setLogin}
            placeholder="Введите логин"
            autoCapitalize="none"
            theme={theme}
          />

          <AppInput
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            placeholder="Введите пароль"
            secureTextEntry
            theme={theme}
            error={errorText || undefined}
          />

          <AppButton
            label={isSubmitting ? "Входим..." : "Войти"}
            onPress={handleSubmit}
            theme={theme}
            disabled={isSubmitting}
          />
        </SectionCard>

        <SectionCard
          title="Демо"
          subtitle="Для локального входа сейчас подойдет любой непустой логин и пароль."
          theme={theme}
        >
          <Text style={styles.helperText}>
            Позже сюда подключим реальную авторизацию через VM Server.
          </Text>
        </SectionCard>
      </View>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center"
    },
    logo: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textAlign: "center"
    },
    title: {
      fontSize: theme.typography.title,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.sm
    },
    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl
    },
    helperText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    }
  });
}
