export type TabKey = "lectures" | "favorites" | "settings";

export interface Lecture {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  summary?: string;
  content?: string;
  text?: string;
  body?: string;
  author?: string;
  authorName?: string;
  subject?: string;
  category?: string;
  semester?: string;
  level?: string;
  tags?: string[];
  updatedAt?: string;
  updated_at?: string;
  lastUpdatedAt?: string;
}
