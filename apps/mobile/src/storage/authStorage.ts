import * as SecureStore from "expo-secure-store";

export type StoredAuthSession = {
  accessToken: string;
  userLogin: string;
  role: "student" | "teacher";
  issuedAt: string;
};

const AUTH_SESSION_KEY = "vm.auth.session";

export async function readAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const rawValue = await SecureStore.getItemAsync(AUTH_SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as StoredAuthSession;

    if (
      !parsedValue.accessToken ||
      !parsedValue.userLogin ||
      !parsedValue.role ||
      !parsedValue.issuedAt
    ) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export async function writeAuthSession(
  session: StoredAuthSession
): Promise<void> {
  await SecureStore.setItemAsync(
    AUTH_SESSION_KEY,
    JSON.stringify(session)
  );
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}