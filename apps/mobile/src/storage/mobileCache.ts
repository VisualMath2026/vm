import { createAsyncStorage } from "@react-native-async-storage/async-storage";

import type { LectureItem } from "../mocks/lectures";
import type { ThemeMode } from "../theme";

const storage = createAsyncStorage("vmMobileCache_v2");

const STORAGE_KEYS = {
  catalogSnapshot: "catalogSnapshot_v2",
  lastLectureId: "lastLectureId_v2",
  themeMode: "themeMode_v2",
  notificationsEnabled: "notificationsEnabled_v2"
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  const value = await storage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

export async function readCatalogSnapshot(): Promise<LectureItem[] | null> {
  return readJson<LectureItem[]>(STORAGE_KEYS.catalogSnapshot);
}

export async function writeCatalogSnapshot(lectures: LectureItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.catalogSnapshot, lectures);
}

export async function readLastLectureId(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.lastLectureId);
}

export async function writeLastLectureId(lectureId: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.lastLectureId, lectureId);
}

export async function readThemeMode(): Promise<ThemeMode | null> {
  const value = await storage.getItem(STORAGE_KEYS.themeMode);

  if (value === "light" || value === "dark") {
    return value;
  }

  return null;
}

export async function writeThemeMode(themeMode: ThemeMode): Promise<void> {
  await storage.setItem(STORAGE_KEYS.themeMode, themeMode);
}

export async function readNotificationsEnabled(): Promise<boolean | null> {
  const value = await storage.getItem(STORAGE_KEYS.notificationsEnabled);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

export async function writeNotificationsEnabled(enabled: boolean): Promise<void> {
  await storage.setItem(STORAGE_KEYS.notificationsEnabled, String(enabled));
}