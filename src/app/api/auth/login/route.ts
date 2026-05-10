import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { findMockUser, MOCK_USERS, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const mockUser = findMockUser(body.email.trim().toLowerCase(), body.password);
  if (!mockUser) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Upsert the user in the database so foreign keys work.
  await prisma.user.upsert({
    where: { id: mockUser.id },
    update: {},
    create: { id: mockUser.id, email: mockUser.email },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, mockUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return Response.json({
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
  });
}
