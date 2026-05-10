import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(
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
  if (
    !body ||
    typeof body.dateKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.dateKey)
  ) {
    return Response.json(
      { error: "Provide { dateKey: 'YYYY-MM-DD' }" },
      { status: 400 }
    );
  }

  await prisma.cancelledOccurrence.upsert({
    where: {
      recurringRuleId_dateKey: {
        recurringRuleId: ruleId,
        dateKey: body.dateKey,
      },
    },
    update: {},
    create: { recurringRuleId: ruleId, dateKey: body.dateKey },
  });

  return new Response(null, { status: 204 });
}
