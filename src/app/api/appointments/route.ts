import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { createdById: userId },
    orderBy: { startsAt: "asc" },
  });

  return Response.json(appointments);
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.title !== "string" ||
    typeof body.startsAt !== "string" ||
    typeof body.endsAt !== "string" ||
    typeof body.customer !== "string"
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);

  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    return Response.json({ error: "Invalid date values" }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return Response.json({ error: "endsAt must be after startsAt" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      title: body.title.trim(),
      startsAt,
      endsAt,
      customer: body.customer.trim(),
      createdById: userId,
    },
  });

  return Response.json(appointment, { status: 201 });
}
