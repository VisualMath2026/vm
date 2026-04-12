export type UserRole = "student" | "teacher" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  group?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}
