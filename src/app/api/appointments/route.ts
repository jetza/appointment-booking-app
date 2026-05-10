import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { expandRecurringRule } from "@/lib/recurrence";
import type { AppointmentDTO } from "@/types";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const [appointments, recurringRules] = await Promise.all([
    prisma.appointment.findMany({
      where: { createdById: userId },
      orderBy: { startsAt: "asc" },
    }),
    prisma.recurringRule.findMany({
      where: { createdById: userId },
      include: { cancellations: true },
    }),
  ]);

  // Expand recurring rules within a rolling window
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - 3);
  const windowEnd = new Date();
  windowEnd.setFullYear(windowEnd.getFullYear() + 1);

  const dtos: AppointmentDTO[] = [
    ...appointments.map((a) => ({
      id: a.id,
      title: a.title,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      customer: a.customer,
      createdById: a.createdById,
      isRecurring: false as const,
    })),
    ...recurringRules.flatMap((rule) =>
      expandRecurringRule(rule, windowStart, windowEnd)
    ),
  ];

  dtos.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return Response.json(dtos);
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId)
    return Response.json({ error: "Unauthenticated" }, { status: 401 });

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
    return Response.json(
      { error: "endsAt must be after startsAt" },
      { status: 400 }
    );
  }

  // Recurring series
  if (body.recurring === true) {
    const durationMin = Math.round(
      (endsAt.getTime() - startsAt.getTime()) / 60000
    );
    const endsOn =
      body.endsOn && typeof body.endsOn === "string"
        ? new Date(body.endsOn)
        : null;

    const rule = await prisma.recurringRule.create({
      data: {
        title: body.title.trim(),
        customer: body.customer.trim(),
        durationMin,
        dayOfWeek: startsAt.getDay(),
        startsOn: startsAt,
        endsOn,
        createdById: userId,
      },
    });
    return Response.json(rule, { status: 201 });
  }

  // One-time appointment
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

