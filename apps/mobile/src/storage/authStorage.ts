import * as SecureStore from "expo-secure-store";
import type { TokenPair, TokenStorage } from "@vm/integration";

export type StoredAuthMeta = {
  userLogin: string;
  role: "student" | "teacher";
  fullName: string;
  group: string;
};

type StoredAuthRecord = {
  tokens: TokenPair | null;
  meta: StoredAuthMeta | null;
};

const AUTH_SESSION_KEY = "vm.auth.session.v200";

function isWeb(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

async function readRawValue(): Promise<string | null> {
  try {
    if (isWeb()) {
      return window.localStorage.getItem(AUTH_SESSION_KEY);
    }

    return await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  } catch {
    return null;
  }
}

async function writeRawValue(value: string | null): Promise<void> {
  try {
    if (isWeb()) {
      if (value === null) {
        window.localStorage.removeItem(AUTH_SESSION_KEY);
      } else {
        window.localStorage.setItem(AUTH_SESSION_KEY, value);
      }

      return;
    }

    if (value === null) {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
      return;
    }

    await SecureStore.setItemAsync(AUTH_SESSION_KEY, value);
  } catch {}
}

function isValidTokenPair(value: unknown): value is TokenPair {
  if (!value || typeof value !== "object") {
    return false;
  }

  const tokenPair = value as Partial<TokenPair>;

  return Boolean(
    typeof tokenPair.accessToken === "string" &&
      typeof tokenPair.refreshToken === "string" &&
      typeof tokenPair.expiresAt === "number"
  );
}

function isValidMeta(value: unknown): value is StoredAuthMeta {
  if (!value || typeof value !== "object") {
    return false;
  }

  const meta = value as Partial<StoredAuthMeta>;

  return Boolean(
    typeof meta.userLogin === "string" &&
      (meta.role === "student" || meta.role === "teacher") &&
      typeof meta.fullName === "string" &&
      typeof meta.group === "string"
  );
}

function isValidRecord(value: unknown): value is StoredAuthRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<StoredAuthRecord>;
  const tokensOk =
    record.tokens === null || record.tokens === undefined || isValidTokenPair(record.tokens);
  const metaOk =
    record.meta === null || record.meta === undefined || isValidMeta(record.meta);

  return tokensOk && metaOk;
}

async function readRecord(): Promise<StoredAuthRecord | null> {
  try {
    const rawValue = await readRawValue();

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isValidRecord(parsedValue)) {
      return null;
    }

    return {
      tokens: parsedValue.tokens ?? null,
      meta: parsedValue.meta ?? null
    };
  } catch {
    return null;
  }
}

async function writeRecord(record: StoredAuthRecord | null): Promise<void> {
  if (!record) {
    await writeRawValue(null);
    return;
  }

  await writeRawValue(JSON.stringify(record));
}

export const mobileTokenStorage: TokenStorage = {
  async get(): Promise<TokenPair | null> {
    const record = await readRecord();
    return record?.tokens ?? null;
  },

  async set(tokens: TokenPair | null): Promise<void> {
    const currentRecord = await readRecord();

    await writeRecord({
      tokens,
      meta: currentRecord?.meta ?? null
    });
  }
};

export async function readAuthMeta(): Promise<StoredAuthMeta | null> {
  const record = await readRecord();
  return record?.meta ?? null;
}

export async function writeAuthMeta(meta: StoredAuthMeta): Promise<void> {
  const currentRecord = await readRecord();

  await writeRecord({
    tokens: currentRecord?.tokens ?? null,
    meta
  });
}

export async function clearAuthSession(): Promise<void> {
  await writeRecord(null);
}