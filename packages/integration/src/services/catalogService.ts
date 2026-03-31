import { err, type LectureDetails, type LectureSummary } from "@vm/shared";
import { HttpClient } from "../http/httpClient";

export class CatalogService {
  constructor(private readonly http: HttpClient) {}

  async listLectures(): Promise<LectureSummary[]> {
    const response = await this.http.getJson<LectureSummary[]>("/lectures");
    return Array.isArray(response) ? response : [];
  }

  async getLecture(id: string): Promise<LectureDetails> {
    if (!id) {
      throw err("VALIDATION", "Lecture id is required");
    }

    return this.http.getJson<LectureDetails>(`/lectures/${id}`);
  }
}
