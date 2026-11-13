export function readStorageJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.warn(`Não foi possível ler ${key}:`, error);
    return fallback;
  }
}

export function writeStorageJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Não foi possível salvar ${key}:`, error);
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Não foi possível remover ${key}:`, error);
  }
}

export const INTERNAL_DEVELOPER_ACCOUNT_ID = "ecobyte-dev-0001";
export const DEVELOPER_ACCOUNT_EMAILS = ["nobre3arthur@gmail.com"];

export function buildAccountStorageKey(
  baseKey: string,
  email?: string,
): string {
  if (!email) return baseKey;
  return `${baseKey}_${email.toLowerCase()}`;
}

export function isDeveloperAccount(
  account?: {
    email?: string;
    internalAccountId?: string;
  } | null,
): boolean {
  if (!account) return false;

  const normalizedEmail = (account.email ?? "").trim().toLowerCase();
  const normalizedId = (account.internalAccountId ?? "").trim().toLowerCase();

  return (
    DEVELOPER_ACCOUNT_EMAILS.includes(normalizedEmail) ||
    normalizedId === INTERNAL_DEVELOPER_ACCOUNT_ID.toLowerCase()
  );
}

export function ensureDeveloperStreak<
  T extends {
    email?: string;
    streak?: number | string;
    lastValidActivityAt?: number | null;
    internalAccountId?: string;
    developerOverrideApplied?: boolean;
  },
>(account: T | null | undefined): T | null {
  if (!account) return account;

  if (!isDeveloperAccount(account)) {
    return account;
  }

  const alreadyApplied = Boolean(account.developerOverrideApplied);
  const currentStreak = Number(account.streak) || 0;

  if (alreadyApplied && currentStreak > 0) {
    return {
      ...account,
      internalAccountId: INTERNAL_DEVELOPER_ACCOUNT_ID,
      developerOverrideApplied: true,
    };
  }

  if (alreadyApplied && currentStreak === 0) {
    return {
      ...account,
      internalAccountId: INTERNAL_DEVELOPER_ACCOUNT_ID,
      developerOverrideApplied: true,
      streak: 15,
      lastValidActivityAt: account.lastValidActivityAt ?? Date.now(),
    } as T;
  }

  return {
    ...account,
    internalAccountId: INTERNAL_DEVELOPER_ACCOUNT_ID,
    developerOverrideApplied: true,
    streak: currentStreak === 0 ? 15 : currentStreak,
    lastValidActivityAt: account.lastValidActivityAt ?? Date.now(),
  } as T;
}

export function getAccounts<T = any[]>(): T {
  return readStorageJson<T>("ecobyte_accounts", [] as T);
}

export function mergeAccountRecord<T extends Record<string, any>>(
  email: string | undefined,
  next: Partial<T>,
): T | null {
  if (!email) return null;

  const accounts = getAccounts<any[]>();
  const normalizedEmail = email.trim().toLowerCase();
  const index = accounts.findIndex(
    (account: any) =>
      (account?.email ?? "").trim().toLowerCase() === normalizedEmail,
  );

  const safeNext = {
    ...(next ?? {}),
    email: next?.email ?? normalizedEmail,
  } as T;

  if (index === -1) {
    const merged = { ...safeNext, email: normalizedEmail } as T;
    accounts.push(merged);
    saveAccounts(accounts);
    return merged;
  }

  const current = accounts[index] ?? {};
  const merged = {
    ...current,
    ...safeNext,
    email: current.email ?? safeNext.email ?? normalizedEmail,
    password: current.password ?? safeNext.password,
  } as T;

  accounts[index] = merged;
  saveAccounts(accounts);
  return merged;
}

export function saveAccounts(accounts: any[]): void {
  writeStorageJson("ecobyte_accounts", accounts);
}

export function getCurrentSession(): { email: string } | null {
  return readStorageJson<{ email: string } | null>("ecobyte_session", null);
}

export function saveSession(email: string): void {
  writeStorageJson("ecobyte_session", { email: email.toLowerCase() });
}

export function clearSession(): void {
  removeStorageItem("ecobyte_session");
}

export type PasswordResetTokenRecord = {
  email: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  usedAt?: number | null;
  attempts: number;
};

export const PASSWORD_RESET_TOKEN_TTL = 60 * 60 * 1000;
export const PASSWORD_RESET_MAX_ATTEMPTS = 3;

export function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export async function createPasswordResetRequest(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const accounts = getAccounts<any[]>();
  const accountExists = accounts.some(
    (account: any) =>
      (account?.email ?? "").trim().toLowerCase() === normalizedEmail,
  );

  const token = generateSecureToken();
  const tokenHash = await hashPassword(token);
  const expiresAt = Date.now() + PASSWORD_RESET_TOKEN_TTL;

  const record: PasswordResetTokenRecord = {
    email: normalizedEmail,
    tokenHash,
    createdAt: Date.now(),
    expiresAt,
    used: false,
    attempts: 0,
  };

  const records = readStorageJson<PasswordResetTokenRecord[]>(
    "ecobyte_password_reset_tokens",
    [],
  );

  const filtered = records.filter(
    (item) => item.email !== normalizedEmail && item.expiresAt > Date.now(),
  );
  filtered.push(record);
  writeStorageJson("ecobyte_password_reset_tokens", filtered.slice(-20));

  const baseUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:5173";

  return {
    token,
    expiresAt,
    recoveryUrl: `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`,
    accountExists,
  };
}

export async function validatePasswordResetToken(
  email: string,
  token: string,
): Promise<{ valid: boolean; record?: PasswordResetTokenRecord }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !token) return { valid: false };

  const records = readStorageJson<PasswordResetTokenRecord[]>(
    "ecobyte_password_reset_tokens",
    [],
  );
  const match = records.find((item) => item.email === normalizedEmail);
  if (!match || match.used || match.expiresAt < Date.now()) {
    return { valid: false };
  }

  const hashed = await hashPassword(token);
  const valid = match.tokenHash === hashed;
  if (valid) {
    return { valid: true, record: match };
  }

  return { valid: false };
}

export async function consumePasswordResetToken(
  email: string,
  token: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const records = readStorageJson<PasswordResetTokenRecord[]>(
    "ecobyte_password_reset_tokens",
    [],
  );

  const index = records.findIndex(
    (item) => item.email === normalizedEmail && !item.used,
  );
  if (index === -1) return false;

  const match = records[index];
  const hashed = await hashPassword(token);
  if (match.expiresAt < Date.now() || match.tokenHash !== hashed) {
    return false;
  }

  match.used = true;
  match.usedAt = Date.now();
  records[index] = match;
  writeStorageJson("ecobyte_password_reset_tokens", records);
  return true;
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return password;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(
  storedPassword: string,
  inputPassword: string,
): Promise<boolean> {
  if (/^[a-f0-9]{64}$/i.test(storedPassword)) {
    const hashedInput = await hashPassword(inputPassword);
    return storedPassword === hashedInput;
  }

  return storedPassword === inputPassword;
}
