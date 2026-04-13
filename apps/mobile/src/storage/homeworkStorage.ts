import { createAsyncStorage } from "@react-native-async-storage/async-storage";

export type HomeworkItem = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  allowedFormats: string[];
  maxScore: number;
  createdBy: string;
  createdAt: string;
};

export type HomeworkSubmissionItem = {
  id: string;
  homeworkId: string;
  studentLogin: string;
  studentName: string;
  fileName: string;
  fileType: string;
  fileData: string;
  submittedAt: string;
  teacherComment: string;
  score: number | null;
};

const storage = createAsyncStorage("vmHomework_v1");

const STORAGE_KEYS = {
  homeworks: "homeworks_v1",
  submissions: "homeworkSubmissions_v1"
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

export async function readHomeworks(): Promise<HomeworkItem[] | null> {
  return readJson<HomeworkItem[]>(STORAGE_KEYS.homeworks);
}

export async function writeHomeworks(homeworks: HomeworkItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.homeworks, homeworks);
}

export async function readHomeworkSubmissions(): Promise<HomeworkSubmissionItem[] | null> {
  return readJson<HomeworkSubmissionItem[]>(STORAGE_KEYS.submissions);
}

export async function writeHomeworkSubmissions(submissions: HomeworkSubmissionItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.submissions, submissions);
}
