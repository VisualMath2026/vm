export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TokenStorage {
  get(): Promise<TokenPair | null>;
  set(tokens: TokenPair | null): Promise<void>;
}

export class MemoryTokenStorage implements TokenStorage {
  private tokens: TokenPair | null = null;

  async get(): Promise<TokenPair | null> {
    return this.tokens;
  }

  async set(tokens: TokenPair | null): Promise<void> {
    this.tokens = tokens;
  }
}