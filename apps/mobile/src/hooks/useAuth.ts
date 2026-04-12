import { useCallback, useEffect, useMemo, useState } from "react";
import { loginWithDemo, logoutSession, restoreSession } from "../auth/authService";
import type { AuthSession } from "../types/auth";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    restoreSession()
      .then((stored) => setSession(stored))
      .finally(() => setAuthHydrated(true));
  }, []);

  const login = useCallback(async (nextSession: AuthSession) => {
    const stored = await loginWithDemo(nextSession);
    setSession(stored);
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
    setSession(null);
  }, []);

  return useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      authHydrated,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session, authHydrated, login, logout],
  );
}
