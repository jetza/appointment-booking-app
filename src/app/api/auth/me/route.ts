import { getSessionUserId, MOCK_USERS } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ id: user.id, email: user.email, name: user.name });
}
