import { MemoryTokenStorage, type TokenPair } from "@vm/integration";
import type { AuthSession } from "../types/auth";

let memorySession: AuthSession | null = null;

export const mobileTokenStorage = new MemoryTokenStorage();

function toTokenPair(session: AuthSession): TokenPair {
  return {
    accessToken: session.token,
    refreshToken: session.refreshToken ?? "",
    expiresAt: Date.now() + 60 * 60 * 1000,
  };
}

export async function saveSession(session: AuthSession): Promise<void> {
  memorySession = session;
  await mobileTokenStorage.set(toTokenPair(session));
}

export async function readSession(): Promise<AuthSession | null> {
  return memorySession;
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  await mobileTokenStorage.set(null);
}
