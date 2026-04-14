import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalStudentAccount = {
  login: string;
  password: string;
  fullName: string;
  group: string;
  createdAt: string;
};

export type TeacherAccount = {
  login: string;
  password: string;
  fullName: string;
  group: string;
};

const STUDENTS_KEY = "vm.local.student.accounts.v1";

const TEACHER_WHITELIST: TeacherAccount[] = [
  {
    login: "teacher",
    password: "teacher",
    fullName: "Преподаватель VisualMath",
    group: "Кафедра математики"
  }
];

function normalizeLogin(value: string): string {
  return value.trim().toLowerCase();
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function readStudentAccounts(): Promise<LocalStudentAccount[]> {
  const value = await readJson<LocalStudentAccount[]>(STUDENTS_KEY);
  return Array.isArray(value) ? value : [];
}

async function writeStudentAccounts(accounts: LocalStudentAccount[]): Promise<boolean> {
  return writeJson(STUDENTS_KEY, accounts);
}

export function findTeacherAccount(login: string, password: string): TeacherAccount | null {
  const safeLogin = normalizeLogin(login);
  const safePassword = password.trim();

  return (
    TEACHER_WHITELIST.find(
      (account) => account.login === safeLogin && account.password === safePassword
    ) ?? null
  );
}

export async function validateStudentCredentials(
  login: string,
  password: string
): Promise<LocalStudentAccount | null> {
  const safeLogin = normalizeLogin(login);
  const safePassword = password.trim();
  const accounts = await readStudentAccounts();

  return (
    accounts.find(
      (account) => account.login === safeLogin && account.password === safePassword
    ) ?? null
  );
}

export async function registerStudentAccount(input: {
  login: string;
  password: string;
  fullName: string;
  group: string;
}): Promise<
  { ok: true; account: LocalStudentAccount } | { ok: false; error: string }
> {
  const safeLogin = normalizeLogin(input.login);
  const safePassword = input.password.trim();
  const safeFullName = input.fullName.trim();

  if (safeLogin.length < 3) {
    return { ok: false, error: "Логин должен быть не короче 3 символов." };
  }

  if (safePassword.length < 4) {
    return { ok: false, error: "Пароль должен быть не короче 4 символов." };
  }

  if (!safeFullName) {
    return { ok: false, error: "Укажи имя студента." };
  }

  if (TEACHER_WHITELIST.some((account) => account.login === safeLogin)) {
    return { ok: false, error: "Этот логин зарезервирован для преподавателя." };
  }

  const accounts = await readStudentAccounts();

  if (accounts.some((account) => account.login === safeLogin)) {
    return { ok: false, error: "Такой студент уже зарегистрирован." };
  }

  const nextAccount: LocalStudentAccount = {
    login: safeLogin,
    password: safePassword,
    fullName: safeFullName,
    group: input.group.trim() || "БПИ-248",
    createdAt: new Date().toISOString()
  };

  const nextAccounts = [nextAccount, ...accounts];
  const saved = await writeStudentAccounts(nextAccounts);

  if (!saved) {
    return { ok: false, error: "Не удалось сохранить регистрацию студента." };
  }

  const reloadedAccounts = await readStudentAccounts();
  const persistedAccount =
    reloadedAccounts.find((account) => account.login === safeLogin) ?? null;

  if (!persistedAccount) {
    return { ok: false, error: "Регистрация не сохранилась. Попробуй ещё раз." };
  }

  return {
    ok: true,
    account: persistedAccount
  };
}