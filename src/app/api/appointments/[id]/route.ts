import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId)
    return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment)
    return Response.json({ error: "Not found" }, { status: 404 });
  if (appointment.createdById !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.appointment.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
