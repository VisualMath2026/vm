import { createAsyncStorage } from "@react-native-async-storage/async-storage";

export type MeetingItem = {
  id: string;
  title: string;
  platform: string;
  url: string;
  scheduledAt: string;
  durationMin: number;
  description: string;
  createdBy: string;
  createdAt: string;
};

const storage = createAsyncStorage("vmMeetings_v1");
const STORAGE_KEY = "meetings_v1";

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

export async function readMeetings(): Promise<MeetingItem[] | null> {
  return readJson<MeetingItem[]>(STORAGE_KEY);
}

export async function writeMeetings(meetings: MeetingItem[]): Promise<void> {
  await writeJson(STORAGE_KEY, meetings);
}
