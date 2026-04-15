export type UserProfile = {
  fullName: string;
  login: string;
  role: "student" | "teacher";
  group: string;
};

export const mockUser: UserProfile = {
  fullName: "Глеб Шкундин",
  login: "gleb",
  role: "student",
  group: "БПИ-248"
};
