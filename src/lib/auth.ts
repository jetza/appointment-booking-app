import { cookies } from "next/headers";
import type { AppUser } from "@/types";

/** Hard-coded demo users. Password check is intentionally trivial (mocked auth). */
export const MOCK_USERS: (AppUser & { password: string })[] = [
  { id: "mock_user_1", email: "alice@demo.com", name: "Alice Demo", password: "demo" },
  { id: "mock_user_2", email: "bob@demo.com", name: "Bob Demo", password: "demo" },
];

export const SESSION_COOKIE = "session_uid";

export function findMockUser(email: string, password: string) {
  return MOCK_USERS.find((u) => u.email === email && u.password === password) ?? null;
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
