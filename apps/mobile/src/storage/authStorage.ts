import * as SecureStore from "expo-secure-store";
import type { TokenPair, TokenStorage } from "@vm/integration";

export type StoredAuthMeta = {
  userLogin: string;
  role: "student" | "teacher";
  fullName: string;
  group: string;
};

type StoredAuthRecord = {
  tokens: TokenPair;
  meta: StoredAuthMeta;
};

const AUTH_SESSION_KEY = "vm.auth.session";

function isValidRecord(value: unknown): value is StoredAuthRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<StoredAuthRecord>;

  return Boolean(
    record.tokens &&
      typeof record.tokens.accessToken === "string" &&
      typeof record.tokens.refreshToken === "string" &&
      typeof record.tokens.expiresAt === "number" &&
      record.meta &&
      typeof record.meta.userLogin === "string" &&
      (record.meta.role === "student" || record.meta.role === "teacher") &&
      typeof record.meta.fullName === "string" &&
      typeof record.meta.group === "string"
  );
}

async function readRecord(): Promise<StoredAuthRecord | null> {
  try {
    const rawValue = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    if (!isValidRecord(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

async function writeRecord(record: StoredAuthRecord | null): Promise<void> {
  if (!record) {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(record));
}

export const mobileTokenStorage: TokenStorage = {
  async get(): Promise<TokenPair | null> {
    const record = await readRecord();
    return record?.tokens ?? null;
  },

  async set(tokens: TokenPair | null): Promise<void> {
    const currentRecord = await readRecord();

    if (!tokens) {
      await writeRecord(null);
      return;
    }

    await writeRecord({
      tokens,
      meta: currentRecord?.meta ?? {
        userLogin: "",
        role: "student",
        fullName: "",
        group: ""
      }
    });
  }
};

export async function readAuthMeta(): Promise<StoredAuthMeta | null> {
  const record = await readRecord();
  return record?.meta ?? null;
}

export async function writeAuthMeta(meta: StoredAuthMeta): Promise<void> {
  const currentRecord = await readRecord();

  if (!currentRecord?.tokens) {
    return;
  }

  await writeRecord({
    tokens: currentRecord.tokens,
    meta
  });
}

export async function clearAuthSession(): Promise<void> {
  await writeRecord(null);
}
