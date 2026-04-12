import type { AuthSession } from "../types/auth";

let memorySession: AuthSession | null = null;

export async function saveSession(session: AuthSession): Promise<void> {
  memorySession = session;
}

export async function readSession(): Promise<AuthSession | null> {
  return memorySession;
}

export async function clearSession(): Promise<void> {
  memorySession = null;
}
