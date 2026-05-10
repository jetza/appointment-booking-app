import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { ruleId } = await params;
  const rule = await prisma.recurringRule.findUnique({ where: { id: ruleId } });
  if (!rule) return Response.json({ error: "Not found" }, { status: 404 });
  if (rule.createdById !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  return Response.json({
    ...rule,
    startsOn: rule.startsOn.toISOString(),
    endsOn: rule.endsOn?.toISOString() ?? null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { ruleId } = await params;
  const rule = await prisma.recurringRule.findUnique({ where: { id: ruleId } });
  if (!rule) return Response.json({ error: "Not found" }, { status: 404 });
  if (rule.createdById !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const startsOn = body.startsAt ? new Date(body.startsAt) : rule.startsOn;
  const endsAtDate = body.endsAt
    ? new Date(body.endsAt)
    : new Date(rule.startsOn.getTime() + rule.durationMin * 60000);
  const durationMin = Math.round(
    (endsAtDate.getTime() - startsOn.getTime()) / 60000
  );

  if (durationMin <= 0) {
    return Response.json(
      { error: "endsAt must be after startsAt" },
      { status: 400 }
    );
  }

  const endsOn =
    body.endsOn !== undefined
      ? body.endsOn
        ? new Date(body.endsOn)
        : null
      : rule.endsOn;

  const updated = await prisma.recurringRule.update({
    where: { id: ruleId },
    data: {
      title: typeof body.title === "string" ? body.title.trim() : rule.title,
      customer:
        typeof body.customer === "string"
          ? body.customer.trim()
          : rule.customer,
      durationMin,
      dayOfWeek: startsOn.getDay(),
      startsOn,
      endsOn,
    },
  });

  return Response.json({
    ...updated,
    startsOn: updated.startsOn.toISOString(),
    endsOn: updated.endsOn?.toISOString() ?? null,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { ruleId } = await params;
  const rule = await prisma.recurringRule.findUnique({ where: { id: ruleId } });
  if (!rule) return Response.json({ error: "Not found" }, { status: 404 });
  if (rule.createdById !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  await prisma.recurringRule.delete({ where: { id: ruleId } });
  return new Response(null, { status: 204 });
}
