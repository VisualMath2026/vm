import { err } from "@vm/shared";
import { HttpClient } from "../http/httpClient";
import type { TokenPair, TokenStorage } from "./tokenStorage";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
}

export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly storage: TokenStorage
  ) {}

  async login(login: string, password: string): Promise<void> {
    if (!login || !password) {
      throw err("VALIDATION", "Login and password are required");
    }

    const response = await this.http.postJson<LoginResponse>("/auth/login", {
      login,
      password
    });

    const tokens: TokenPair = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + response.expiresInSec * 1000
    };

    await this.storage.set(tokens);
  }

  async logout(): Promise<void> {
    await this.storage.set(null);
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.storage.get();
    if (!tokens) {
      return null;
    }

    if (Date.now() > tokens.expiresAt) {
      return null;
    }

    return tokens.accessToken;
  }

  async refresh(): Promise<void> {
    const tokens = await this.storage.get();
    if (!tokens) {
      throw err("AUTH", "Missing refresh token");
    }

    const response = await this.http.postJson<LoginResponse>("/auth/refresh", {
      refreshToken: tokens.refreshToken
    });

    const nextTokens: TokenPair = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + response.expiresInSec * 1000
    };

    await this.storage.set(nextTokens);
  }
}