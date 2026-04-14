import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import type { AppTheme } from "../theme";

export type LoginRole = "student" | "teacher";
export type AuthMode = "login" | "register";

export type GoogleLoginPayload = {
  mode: AuthMode;
  email?: string;
  fullName?: string;
  name?: string;
};

export type VkLoginPayload = {
  mode: AuthMode;
  email?: string;
  fullName?: string;
  name?: string;
  vkId?: string;
};

type LoginScreenProps = {
  theme: AppTheme;
  onLogin: (input: {
    login: string;
    password: string;
    role: LoginRole;
    mode: AuthMode;
    fullName?: string;
  }) => Promise<string | null>;
  onGoogleLogin: (payload: GoogleLoginPayload) => Promise<string | null>;
  onVkLogin: (payload: VkLoginPayload) => Promise<string | null>;
};

export function LoginScreen({
  theme,
  onLogin,
  onGoogleLogin,
  onVkLogin
}: LoginScreenProps) {
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  const [role, setRole] = useState<LoginRole>("student");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isVkSubmitting, setIsVkSubmitting] = useState(false);

  const roleTitle = useMemo(() => {
    if (role === "teacher") {
      return "Вход преподавателя";
    }

    return authMode === "register" ? "Регистрация студента" : "Вход студента";
  }, [role, authMode]);

  const roleSubtitle = useMemo(() => {
    if (role === "teacher") {
      return "Доступ преподавателя открыт только по выданному логину и паролю.";
    }

    return authMode === "register"
      ? "Сначала зарегистрируйся, потом входи только под своими данными."
      : "Без регистрации доступ к каталогу и материалам закрыт.";
  }, [role, authMode]);

  const submitLabel = useMemo(() => {
    if (role === "teacher") {
      return "Войти как преподаватель";
    }

    return authMode === "register" ? "Зарегистрироваться" : "Войти как студент";
  }, [role, authMode]);

  const helperText = useMemo(() => {
    if (role === "teacher") {
      return "Преподавательский доступ: teacher / teacher";
    }

    return authMode === "register"
      ? "После регистрации студент входит только по сохранённому логину и паролю."
      : "Если аккаунта ещё нет, сначала зарегистрируйся.";
  }, [role, authMode]);

  function applyPreset(nextRole: LoginRole, nextMode: AuthMode) {
    setError("");
    setSuccessText("");
    setFullName("");
    setLogin("");
    setPassword("");

    if (nextRole === "teacher" && nextMode === "login") {
      setLogin("teacher");
      setPassword("teacher");
    }
  }

  function handleRoleChange(nextRole: LoginRole) {
    setRole(nextRole);

    if (nextRole === "teacher") {
      setAuthMode("login");
      applyPreset(nextRole, "login");
      return;
    }

    applyPreset(nextRole, authMode);
  }

  function handleModeChange(nextMode: AuthMode) {
    if (role === "teacher") {
      return;
    }

    setAuthMode(nextMode);
    applyPreset(role, nextMode);
  }

  async function handleSubmit() {
    if (!login.trim() || !password.trim()) {
      setError("Заполни логин и пароль.");
      return;
    }

    if (role === "student" && authMode === "register" && !fullName.trim()) {
      setError("Укажи имя студента.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessText("");

    try {
      const nextError = await onLogin({
        login,
        password,
        role,
        mode: authMode,
        fullName
      });

      if (nextError?.startsWith("REGISTRATION_SUCCESS::")) {
        const registeredLogin = nextError.replace("REGISTRATION_SUCCESS::", "").trim();

        setAuthMode("login");
        setRole("student");
        setLogin(registeredLogin);
        setPassword("");
        setSuccessText("Студент зарегистрирован. Теперь войди под своим логином и паролем.");
        return;
      }

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
    setSuccessText("");

    try {
      const nextError = await onGoogleLogin({
        mode: authMode
      });

      if (nextError) {
        setError(nextError);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  async function handleVk() {
    setIsVkSubmitting(true);
    setError("");
    setSuccessText("");

    try {
      const nextError = await onVkLogin({
        mode: authMode
      });

      if (nextError) {
        setError(nextError);
      }
    } finally {
      setIsVkSubmitting(false);
    }
  }

  return (
    <Screen theme={theme}>
      <View style={styles.page}>
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VisualMath</Text>
          </View>

          <Text style={styles.heroTitle}>Цифровой класс математики</Text>
          <Text style={styles.heroSubtitle}>
            Закрытый учебный кабинет: курсы, лекции, материалы, встречи, домашние задания и результаты.
          </Text>

          <View style={styles.roleGrid}>
            <RoleCard
              theme={theme}
              title="Студент"
              subtitle="Регистрация, вход и учебные материалы"
              accent="С"
              isActive={role === "student"}
              onPress={() => handleRoleChange("student")}
              fullWidth={width < 720}
            />
            <RoleCard
              theme={theme}
              title="Преподаватель"
              subtitle="Вход только по выданным данным"
              accent="П"
              isActive={role === "teacher"}
              onPress={() => handleRoleChange("teacher")}
              fullWidth={width < 720}
            />
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
            {role === "student" ? (
              <ModeChip
                theme={theme}
                label="Регистрация"
                isActive={authMode === "register"}
                onPress={() => handleModeChange("register")}
              />
            ) : null}
          </View>

          <Text style={styles.formTitle}>{roleTitle}</Text>
          <Text style={styles.formSubtitle}>{roleSubtitle}</Text>

          {role === "student" && authMode === "register" ? (
            <AppInput
              label="Имя студента"
              theme={theme}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Например: Глеб Шкундин"
              autoCorrect={false}
            />
          ) : null}

          <AppInput
            label={role === "teacher" ? "Логин преподавателя" : "Логин студента"}
            theme={theme}
            value={login}
            onChangeText={setLogin}
            placeholder={role === "teacher" ? "teacher" : "student_login"}
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
          {successText ? <Text style={styles.successText}>{successText}</Text> : null}

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
                label={isGoogleSubmitting ? "Подключаем Google..." : "Продолжить через Google"}
                onPress={() => {
                  void handleGoogle();
                }}
                theme={theme}
                variant="secondary"
                style={styles.socialButton}
              />

              <AppButton
                label={isVkSubmitting ? "Подключаем VK..." : "Продолжить через VK"}
                onPress={() => {
                  void handleVk();
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

type RoleCardProps = {
  theme: AppTheme;
  title: string;
  subtitle: string;
  accent: string;
  isActive: boolean;
  onPress: () => void;
  fullWidth: boolean;
};

function RoleCard({
  theme,
  title,
  subtitle,
  accent,
  isActive,
  onPress,
  fullWidth
}: RoleCardProps) {
  const styles = createRoleCardStyles(theme, isActive, fullWidth);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{accent}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function createRoleCardStyles(theme: AppTheme, isActive: boolean, fullWidth: boolean) {
  return StyleSheet.create({
    card: {
      flexBasis: fullWidth ? "100%" : undefined,
      flex: fullWidth ? undefined : 1,
      minHeight: 108,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
      ...(isActive ? theme.shadow.sm : {})
    },
    icon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceMuted,
      marginBottom: theme.spacing.sm
    },
    iconText: {
      color: isActive ? "#FFFFFF" : theme.colors.text,
      fontSize: 16,
      fontWeight: "900"
    },
    title: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.caption,
      lineHeight: 18,
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
      minHeight: 44,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center"
    },
    label: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: isActive ? theme.colors.primary : theme.colors.text
    }
  });
}

function createStyles(theme: AppTheme, width: number) {
  const isPhone = width < 520;
  const isCompact = width < 720;

  return StyleSheet.create({
    page: {
      width: "100%",
      maxWidth: 900,
      alignSelf: "center"
    },
    heroCard: {
      borderRadius: theme.radius.lg,
      padding: isPhone ? theme.spacing.lg : theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.md
    },
    badge: {
      alignSelf: "flex-start",
      minHeight: 28,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      justifyContent: "center",
      marginBottom: theme.spacing.md
    },
    badgeText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary
    },
    heroTitle: {
      fontSize: isPhone ? 24 : theme.typography.title,
      lineHeight: isPhone ? 30 : theme.typography.title + 4,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    roleGrid: {
      flexDirection: isCompact ? "column" : "row"
    },
    formCard: {
      borderRadius: theme.radius.lg,
      padding: isPhone ? theme.spacing.lg : theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.md
    },
    modeRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.lg
    },
    formTitle: {
      fontSize: isPhone ? 22 : theme.typography.screenTitle,
      lineHeight: isPhone ? 28 : theme.typography.screenTitle + 4,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    formSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginBottom: theme.spacing.sm,
      fontWeight: "700"
    },
    successText: {
      color: theme.colors.success,
      fontSize: theme.typography.caption,
      marginBottom: theme.spacing.sm,
      fontWeight: "700"
    },
    primaryButton: {
      marginTop: theme.spacing.xs
    },
    socialButton: {
      marginBottom: theme.spacing.sm
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