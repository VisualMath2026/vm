import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import type { AppTheme } from "../theme";

WebBrowser.maybeCompleteAuthSession();

type LoginRole = "student" | "teacher";
type AuthMode = "login" | "register";

export type GoogleLoginPayload = {
  email: string;
  name: string;
  picture?: string | null;
};

type LoginScreenProps = {
  theme: AppTheme;
  onLogin: (
    login: string,
    password: string,
    role: LoginRole
  ) => Promise<string | null>;
  onGoogleLogin: (payload: GoogleLoginPayload) => Promise<string | null>;
};

export function LoginScreen({ theme, onLogin, onGoogleLogin }: LoginScreenProps) {
  const styles = createStyles(theme);

  const [role, setRole] = useState<LoginRole>("student");
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
  const redirectUri = "http://localhost:8081";

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: "token"
  });

  useEffect(() => {
    if (response?.type !== "success") {
      return;
    }

    const accessToken =
      response.authentication?.accessToken ??
      (typeof response.params?.access_token === "string"
        ? response.params.access_token
        : "");

    if (!accessToken) {
      setGoogleError("Google не вернул access token.");
      setIsGoogleSubmitting(false);
      return;
    }

    void (async () => {
      try {
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const profile = (await profileResponse.json()) as {
          email?: string;
          name?: string;
          picture?: string;
        };

        if (!profileResponse.ok || !profile.email) {
          setGoogleError("Не удалось получить профиль Google.");
          return;
        }

        const nextError = await onGoogleLogin({
          email: profile.email,
          name: profile.name || profile.email,
          picture: profile.picture ?? null
        });

        if (nextError) {
          setGoogleError(nextError);
        }
      } catch {
        setGoogleError("Ошибка входа через Google.");
      } finally {
        setIsGoogleSubmitting(false);
      }
    })();
  }, [response, onGoogleLogin]);

  async function submit(nextLogin: string, nextPassword: string, nextRole: LoginRole) {
    setIsSubmitting(true);
    setError("");
    setGoogleError("");

    try {
      const result = await onLogin(nextLogin.trim(), nextPassword.trim(), nextRole);
      if (result) {
        setError(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePrimaryAction() {
    const nextLogin = login.trim();
    const nextPassword = password.trim();

    if (role === "student" && mode === "register" && !name.trim()) {
      setError("Введите имя.");
      return;
    }

    if (!nextLogin || !nextPassword) {
      setError("Введите логин и пароль.");
      return;
    }

    await submit(nextLogin, nextPassword, role);
  }

  async function handleGooglePress() {
    if (!googleClientId || !request) {
      setGoogleError("Сначала добавьте Google Web Client ID в apps/mobile/.env.local");
      return;
    }

    setGoogleError("");
    setError("");
    setIsGoogleSubmitting(true);

    const result = await promptAsync();

    if (result.type !== "success") {
      setIsGoogleSubmitting(false);
      if (result.type !== "dismiss" && result.type !== "cancel") {
        setGoogleError("Вход через Google не завершен.");
      }
    }
  }

  const primaryLabel =
    role === "teacher"
      ? "Войти как преподаватель"
      : mode === "register"
        ? "Создать аккаунт"
        : "Войти как студент";

  return (
    <Screen theme={theme}>
      <View style={styles.hero}>
        <Text style={styles.title}>VisualMath</Text>
        <Text style={styles.subtitle}>
          Вход для студентов и преподавателей
        </Text>
      </View>

      <View style={styles.segmentRow}>
        <SegmentButton
          theme={theme}
          label="Студент"
          active={role === "student"}
          onPress={() => {
            setRole("student");
            setError("");
            setGoogleError("");
          }}
        />
        <SegmentButton
          theme={theme}
          label="Преподаватель"
          active={role === "teacher"}
          onPress={() => {
            setRole("teacher");
            setMode("login");
            setError("");
            setGoogleError("");
          }}
        />
      </View>

      {role === "student" ? (
        <View style={styles.segmentRow}>
          <SegmentButton
            theme={theme}
            label="Вход"
            active={mode === "login"}
            onPress={() => {
              setMode("login");
              setError("");
              setGoogleError("");
            }}
          />
          <SegmentButton
            theme={theme}
            label="Регистрация"
            active={mode === "register"}
            onPress={() => {
              setMode("register");
              setError("");
              setGoogleError("");
            }}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {role === "teacher"
            ? "Вход преподавателя"
            : mode === "register"
              ? "Регистрация студента"
              : "Вход студента"}
        </Text>

        {role === "student" && mode === "register" ? (
          <AppInput
            label="Имя"
            theme={theme}
            value={name}
            onChangeText={setName}
            placeholder="Введите имя"
            autoCorrect={false}
          />
        ) : null}

        <AppInput
          label={role === "teacher" ? "Логин" : "Email или логин"}
          theme={theme}
          value={login}
          onChangeText={setLogin}
          placeholder={role === "teacher" ? "Введите логин" : "Введите email или логин"}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <AppInput
          label="Пароль"
          theme={theme}
          value={password}
          onChangeText={setPassword}
          placeholder="Введите пароль"
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AppButton
          label={isSubmitting ? "Подождите..." : primaryLabel}
          onPress={() => void handlePrimaryAction()}
          theme={theme}
          style={styles.primaryAction}
        />

        {role === "student" ? (
          <>
            <View style={styles.dividerWrap}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              disabled={!request || isGoogleSubmitting}
              onPress={() => void handleGooglePress()}
              style={[
                styles.googleButton,
                {
                  opacity: !request || isGoogleSubmitting ? 0.6 : 1
                }
              ]}
            >
              <Text style={styles.googleButtonText}>
                {isGoogleSubmitting ? "Открываем Google..." : "Войти через Google"}
              </Text>
            </Pressable>

            {googleError ? <Text style={styles.errorText}>{googleError}</Text> : null}
          </>
        ) : null}

        {isSubmitting || isGoogleSubmitting ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

type SegmentButtonProps = {
  theme: AppTheme;
  label: string;
  active: boolean;
  onPress: () => void;
};

function SegmentButton({ theme, label, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.surfaceMuted : theme.colors.surface
      }}
    >
      <Text
        style={{
          fontSize: theme.typography.body,
          fontWeight: "700",
          color: active ? theme.colors.primary : theme.colors.text
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    hero: {
      marginBottom: theme.spacing.lg
    },
    title: {
      fontSize: theme.typography.screenTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    segmentRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md
    },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: theme.spacing.lg
    },
    cardTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.md
    },
    primaryAction: {
      marginTop: theme.spacing.md
    },
    googleButton: {
      minHeight: 52,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginTop: theme.spacing.sm
    },
    googleButtonText: {
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    loaderWrap: {
      marginTop: theme.spacing.md,
      alignItems: "center"
    },
    dividerWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border
    },
    dividerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption
    }
  });
}
