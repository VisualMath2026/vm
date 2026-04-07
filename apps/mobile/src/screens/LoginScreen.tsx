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
  ) => Promise<string | null>;
};

export function LoginScreen({ theme, onLogin }: LoginScreenProps) {
  const styles = createStyles(theme);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const maybeError = await onLogin(login, password, selectedRole);

      if (maybeError) {
        setErrorText(maybeError);
        return;
      }

      setErrorText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen theme={theme} scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.logo}>VisualMath</Text>
        <Text style={styles.title}>Вход в VM Mobile</Text>
        <Text style={styles.subtitle}>
          Выбери роль и войди в приложение через API VM Server.
        </Text>

        <SectionCard
          theme={theme}
          title="Авторизация"
          subtitle="Для mock server используй student/student или teacher/teacher"
        >
          <AppInput
            label="Логин"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Введите логин"
            theme={theme}
          />

          <AppInput
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Введите пароль"
            theme={theme}
            error={errorText || undefined}
          />

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

          <Text style={styles.helperText}>
            Роль преподавателя открывает экран управления сессией.
          </Text>

          <AppButton
            label={isSubmitting ? "Входим..." : "Войти"}
            onPress={() => void handleSubmit()}
            theme={theme}
            disabled={isSubmitting}
            style={{ marginTop: theme.spacing.lg }}
          />
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

function RoleButton({ theme, label, isActive, onPress }: RoleButtonProps) {
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleButton,
        {
          backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: isActive ? theme.colors.primary : theme.colors.border
        }
      ]}
    >
      <Text
        style={[
          styles.roleButtonText,
          {
            color: isActive ? theme.colors.primary : theme.colors.text
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
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md
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
