import { endpoints, API_BASE_URL } from "./endpoints";
import { http } from "../services/http";
import type { Lecture } from "../types/lecture";
import type { AuthSession } from "../types/auth";

export { API_BASE_URL };

export const lecturesUrl = `${API_BASE_URL}${endpoints.lectures}`;

export async function fetchLectures(token?: string): Promise<Lecture[]> {
  return http<Lecture[]>(endpoints.lectures, {
    method: "GET",
    token,
  });
}

export async function demoLogin(session: AuthSession): Promise<AuthSession> {
  return Promise.resolve(session);
}

export async function checkHealth(): Promise<{ status: string }> {
  return http<{ status: string }>(endpoints.health, {
    method: "GET",
  });
}
