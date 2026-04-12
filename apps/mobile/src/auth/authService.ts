import { demoLogin } from "../api/client";
import { clearSession, readSession, saveSession } from "./tokenStorage";
import type { AuthSession } from "../types/auth";

export async function loginWithDemo(session: AuthSession): Promise<AuthSession> {
  const result = await demoLogin(session);
  await saveSession(result);
  return result;
}

export async function restoreSession(): Promise<AuthSession | null> {
  return readSession();
}

export async function logoutSession(): Promise<void> {
  await clearSession();
}
