import { createAsyncStorage } from "@react-native-async-storage/async-storage";

export type TeacherBranch = {
  teacherLogin: string;
  teacherName: string;
  title: string;
  description: string;
  createdAt: string;
};

const storage = createAsyncStorage("vmTeacherBranches_v1");

const STORAGE_KEYS = {
  branches: "teacherBranches_v1",
  selectedTeacherLogin: "selectedTeacherLogin_v1"
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

export async function readTeacherBranches(): Promise<TeacherBranch[] | null> {
  return readJson<TeacherBranch[]>(STORAGE_KEYS.branches);
}

export async function writeTeacherBranches(branches: TeacherBranch[]): Promise<void> {
  await writeJson(STORAGE_KEYS.branches, branches);
}

export async function readSelectedTeacherLogin(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.selectedTeacherLogin);
}

export async function writeSelectedTeacherLogin(value: string | null): Promise<void> {
  if (!value) {
    await storage.removeItem(STORAGE_KEYS.selectedTeacherLogin);
    return;
  }

  await storage.setItem(STORAGE_KEYS.selectedTeacherLogin, value);
}
