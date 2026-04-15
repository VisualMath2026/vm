import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import type { AppTheme } from "../theme";

export type GoogleLoginPayload = {
  email?: string;
  fullName?: string;
  name?: string;
};

type LoginRole = "student" | "teacher";
type AuthMode = "login" | "register";

type LoginScreenProps = {
  theme: AppTheme;
  onLogin: (login: string, password: string, role: LoginRole) => Promise<string | null>;
  onGoogleLogin: (payload: GoogleLoginPayload) => Promise<string | null>;
};

export function LoginScreen({ theme, onLogin, onGoogleLogin }: LoginScreenProps) {
  const styles = createStyles(theme);

  const [role, setRole] = useState<LoginRole>("student");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("student");
  const [password, setPassword] = useState("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const roleTitle = useMemo(() => {
    if (role === "teacher") {
      return authMode === "login" ? "Вход преподавателя" : "Регистрация преподавателя";
    }

    return authMode === "login" ? "Вход студента" : "Регистрация студента";
  }, [role, authMode]);

  const roleSubtitle = useMemo(() => {
    if (role === "teacher") {
      return authMode === "login"
        ? "Управление лекциями, сессиями, вопросами и материалами."
        : "Создай преподавательский профиль и перейди в рабочий кабинет.";
    }

    return authMode === "login"
      ? "Доступ к лекциям, LaTeX-материалам, видео и заданиям."
      : "Создай студенческий профиль и начни работу с курсом.";
  }, [role, authMode]);

  const submitLabel = useMemo(() => {
    if (authMode === "register") {
      return role === "teacher" ? "Создать профиль преподавателя" : "Создать профиль студента";
    }

    return role === "teacher" ? "Войти как преподаватель" : "Войти как студент";
  }, [role, authMode]);

  const helperText = useMemo(() => {
    if (authMode === "register") {
      return role === "teacher"
        ? "В демо-версии регистрация сразу открывает кабинет преподавателя."
        : "В демо-версии регистрация сразу открывает студенческий кабинет.";
    }

    return role === "teacher"
      ? "Демо-вход: teacher / teacher"
      : "Демо-вход: student / student";
  }, [role, authMode]);

  function applyPreset(nextRole: LoginRole, nextMode: AuthMode) {
    if (nextMode === "login") {
      setLogin(nextRole === "teacher" ? "teacher" : "student");
      setPassword(nextRole === "teacher" ? "teacher" : "student");
    } else {
      setLogin("");
      setPassword("");
    }
  }

  function handleRoleChange(nextRole: LoginRole) {
    setRole(nextRole);
    setError("");
    applyPreset(nextRole, authMode);
  }

  function handleModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setError("");
    applyPreset(role, nextMode);
  }

  async function handleSubmit() {
    if (!login.trim() || !password.trim()) {
      setError("Заполни логин и пароль.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const nextError = await onLogin(login, password, role);

      if (nextError) {
        setError(nextError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    setIsGoogleSubmitting(true);
    setError("");

    try {
      const nextError = await onGoogleLogin({
        email: authMode === "register" ? "new_student@example.com" : "google_student@example.com",
        fullName: authMode === "register" ? "Новый студент" : "Google студент"
      });

      if (nextError) {
        setError(nextError);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <Screen theme={theme}>
      <View style={styles.page}>
        <View style={styles.heroCard}>
          <View style={styles.logoOrb}>
            <Text style={styles.logoLetters}>VM</Text>
          </View>

          <Text style={styles.brand}>VisualMath</Text>
          <Text style={styles.heroSubtitle}>
            Умная образовательная платформа для математики, визуальных модулей и интерактивных материалов.
          </Text>

          <View style={styles.branchSection}>
            <View style={styles.branchStem} />
            <View style={styles.branchRowLine} />

            <View style={styles.roleRow}>
              <RoleBranchCard
                theme={theme}
                title="Студент"
                subtitle="Лекции, практика, PDF и LaTeX"
                isActive={role === "student"}
                onPress={() => handleRoleChange("student")}
                align="left"
              />
              <RoleBranchCard
                theme={theme}
                title="Преподаватель"
                subtitle="Лекции, сессии, редактор и материалы"
                isActive={role === "teacher"}
                onPress={() => handleRoleChange("teacher")}
                align="right"
              />
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.modeRow}>
            <ModeChip
              theme={theme}
              label="Вход"
              isActive={authMode === "login"}
              onPress={() => handleModeChange("login")}
            />
            <ModeChip
              theme={theme}
              label="Регистрация"
              isActive={authMode === "register"}
              onPress={() => handleModeChange("register")}
            />
          </View>

          <Text style={styles.formTitle}>{roleTitle}</Text>
          <Text style={styles.formSubtitle}>{roleSubtitle}</Text>

          <AppInput
            label={authMode === "register" ? "Email или новый логин" : "Email или логин"}
            theme={theme}
            value={login}
            onChangeText={setLogin}
            placeholder={role === "teacher" ? "teacher" : "student"}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <AppInput
            label="Пароль"
            theme={theme}
            value={password}
            onChangeText={setPassword}
            placeholder={authMode === "register" ? "Придумай пароль" : "Введите пароль"}
            secureTextEntry
            autoCorrect={false}
            autoCapitalize="none"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AppButton
            label={isSubmitting ? "Подождите..." : submitLabel}
            onPress={() => {
              void handleSubmit();
            }}
            theme={theme}
            style={styles.primaryButton}
          />

          {role === "student" ? (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>или</Text>
                <View style={styles.dividerLine} />
              </View>

              <AppButton
                label={isGoogleSubmitting ? "Подключаем Google..." : authMode === "register" ? "Зарегистрироваться через Google" : "Войти через Google"}
                onPress={() => {
                  void handleGoogle();
                }}
                theme={theme}
                variant="secondary"
              />
            </>
          ) : null}

          <Text style={styles.helperText}>{helperText}</Text>
        </View>
      </View>
    </Screen>
  );
}

type RoleBranchCardProps = {
  theme: AppTheme;
  title: string;
  subtitle: string;
  isActive: boolean;
  onPress: () => void;
  align: "left" | "right";
};

function RoleBranchCard({
  theme,
  title,
  subtitle,
  isActive,
  onPress,
  align
}: RoleBranchCardProps) {
  const styles = createRoleBranchCardStyles(theme, isActive, align);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.dot} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function createRoleBranchCardStyles(theme: AppTheme, isActive: boolean, align: "left" | "right") {
  return StyleSheet.create({
    card: {
      flex: 1,
      minHeight: 120,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
      ...(isActive ? theme.shadow.md : theme.shadow.sm),
      marginLeft: align === "right" ? theme.spacing.sm : 0,
      marginRight: align === "left" ? theme.spacing.sm : 0
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 999,
      backgroundColor: isActive ? theme.colors.primary : theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    title: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.caption,
      lineHeight: 19,
      color: theme.colors.textSecondary
    }
  });
}

type ModeChipProps = {
  theme: AppTheme;
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function ModeChip({ theme, label, isActive, onPress }: ModeChipProps) {
  const styles = createModeChipStyles(theme, isActive);

  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createModeChipStyles(theme: AppTheme, isActive: boolean) {
  return StyleSheet.create({
    chip: {
      flex: 1,
      minHeight: 48,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...(isActive ? theme.shadow.sm : {})
    },
    label: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: isActive ? theme.colors.primary : theme.colors.text
    }
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    page: {
      width: "100%",
      maxWidth: 1280,
      alignSelf: "center"
    },
    heroCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xxl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xl,
      alignItems: "center",
      ...theme.shadow.lg
    },
    logoOrb: {
      width: 112,
      height: 112,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.md
    },
    logoLetters: {
      color: "#FFFFFF",
      fontSize: 34,
      fontWeight: "900",
      letterSpacing: 1
    },
    brand: {
      fontSize: theme.typography.hero,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      letterSpacing: -0.8
    },
    heroSubtitle: {
      maxWidth: 760,
      textAlign: "center",
      fontSize: theme.typography.body,
      lineHeight: 26,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl
    },
    branchSection: {
      width: "100%",
      maxWidth: 980,
      alignItems: "center"
    },
    branchStem: {
      width: 2,
      height: 28,
      backgroundColor: theme.colors.border
    },
    branchRowLine: {
      width: "70%",
      height: 2,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.lg
    },
    roleRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch"
    },
    formCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xxl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.lg
    },
    modeRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xl
    },
    formTitle: {
      fontSize: theme.typography.screenTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    formSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginBottom: theme.spacing.sm,
      fontWeight: "600"
    },
    primaryButton: {
      marginTop: theme.spacing.sm
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption,
      fontWeight: "700"
    },
    helperText: {
      marginTop: theme.spacing.lg,
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: "center"
    }
  });
}
