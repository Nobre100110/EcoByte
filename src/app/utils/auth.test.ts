import { describe, expect, it } from "vitest";
import { buildSupabaseRedirectUrl } from "./auth";
import {
  getAccounts,
  getCurrentSession,
  hashPassword,
  saveAccounts,
  saveSession,
  verifyPassword,
} from "./storage";

const createLocalStorageMock = () => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  } as Storage;
};

describe("auth helpers", () => {
  it("builds absolute redirect URLs for Supabase providers and recovery flows", () => {
    const url = buildSupabaseRedirectUrl("/dashboard");
    const parsed = new URL(url);

    expect(parsed.pathname).toBe("/dashboard");
    expect(parsed.href).toContain("dashboard");
  });

  it("uses the same local storage for registration and login, with compatible hashes", async () => {
    const storageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, "window", {
      value: globalThis,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storageMock,
      configurable: true,
      writable: true,
    });

    const email = "novo.usuario@teste.com";
    const password = "Senha@123";
    const hashedPassword = await hashPassword(password);

    saveAccounts([
      {
        email,
        password: hashedPassword,
        name: "Novo Usuário",
      },
    ]);

    const storedAccounts = getAccounts();
    expect(storedAccounts[0]?.email).toBe(email);
    expect(await verifyPassword(storedAccounts[0].password, password)).toBe(
      true,
    );

    saveSession(email);
    expect(getCurrentSession()?.email).toBe(email.toLowerCase());
  });
});
