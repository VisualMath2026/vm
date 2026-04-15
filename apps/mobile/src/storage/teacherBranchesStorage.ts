import AsyncStorage from "@react-native-async-storage/async-storage";

export type TeacherBranch = {
  teacherLogin: string;
  teacherName: string;
  title: string;
  description: string;
  createdAt: string;
};

const STORAGE_KEYS = {
  branches: "vmTeacherBranches_v1:teacherBranches_v1",
  selectedTeacherLogin: "vmTeacherBranches_v1:selectedTeacherLogin_v1"
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);

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
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function readTeacherBranches(): Promise<TeacherBranch[] | null> {
  return readJson<TeacherBranch[]>(STORAGE_KEYS.branches);
}

export async function writeTeacherBranches(branches: TeacherBranch[]): Promise<void> {
  await writeJson(STORAGE_KEYS.branches, branches);
}

export async function readSelectedTeacherLogin(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.selectedTeacherLogin);
}

export async function writeSelectedTeacherLogin(value: string | null): Promise<void> {
  if (!value) {
    await AsyncStorage.removeItem(STORAGE_KEYS.selectedTeacherLogin);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.selectedTeacherLogin, value);
}
