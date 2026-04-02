import React, { useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";

type LoginRole = "student" | "teacher";

type LoginScreenProps = {
  theme: AppTheme;
  onLogin: (
    login: string,
    password: string,
    role: LoginRole
  ) => string | null;
};

export function LoginScreen({
  theme,
  onLogin
}: LoginScreenProps) {
  const styles = createStyles(theme);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    setIsSubmitting(true);
    const maybeError = onLogin(login, password, selectedRole);

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
          Выбери роль и войди в локальный demo-сценарий приложения.
        </Text>

        <SectionCard
          title="Роль пользователя"
          subtitle="Сейчас доступны два режима интерфейса."
          theme={theme}
        >
          <View style={styles.roleRow}>
            <RoleButton
              theme={theme}
              label="Студент"
              isActive={selectedRole === "student"}
              onPress={() => setSelectedRole("student")}
            />
            <RoleButton
              theme={theme}
              label="Преподаватель"
              isActive={selectedRole === "teacher"}
              onPress={() => setSelectedRole("teacher")}
            />
          </View>
        </SectionCard>

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
            Роль преподавателя открывает mock-экран управления сессией.
          </Text>
        </SectionCard>
      </View>
    </Screen>
  );
}

type RoleButtonProps = {
  theme: AppTheme;
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function RoleButton({
  theme,
  label,
  isActive,
  onPress
}: RoleButtonProps) {
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleButton,
        {
          backgroundColor: isActive
            ? theme.colors.surfaceMuted
            : theme.colors.surface,
          borderColor: isActive
            ? theme.colors.primary
            : theme.colors.border
        }
      ]}
    >
      <Text
        style={[
          styles.roleButtonText,
          {
            color: isActive
              ? theme.colors.primary
              : theme.colors.text
          }
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    },
    roleRow: {
      flexDirection: "row",
      gap: theme.spacing.sm
    },
    roleButton: {
      flex: 1,
      minHeight: 52,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md
    },
    roleButtonText: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      textAlign: "center"
    }
  });
}