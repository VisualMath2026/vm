import { err } from "@vm/shared";
import { HttpClient } from "../http/httpClient";

export type QuizAnswerPayload =
  | { type: "single"; optionId: string }
  | { type: "multi"; optionIds: string[] }
  | { type: "short"; text: string };

export interface SubmitQuizRequest {
  sessionId: string;
  blockId: string;
  answers: { questionId: string; payload: QuizAnswerPayload }[];
}

export interface SubmitQuizResponse {
  attemptId: string;
  score: number;
  maxScore: number;
  checkedAt: string;
}

export class QuizService {
  constructor(private readonly http: HttpClient) {}

  async submit(request: SubmitQuizRequest): Promise<SubmitQuizResponse> {
    if (!request.sessionId || !request.blockId) {
      throw err("VALIDATION", "sessionId and blockId are required");
    }

    if (!request.answers?.length) {
      throw err("VALIDATION", "At least one answer is required");
    }

    return this.http.postJson(`/quiz/submit`, request);
  }
}