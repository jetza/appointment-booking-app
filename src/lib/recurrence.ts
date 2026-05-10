import type { AppointmentDTO } from "@/types";

type RuleInput = {
  id: string;
  title: string;
  customer: string;
  durationMin: number;
  startsOn: Date;
  endsOn: Date | null;
  createdById: string;
  cancellations: { dateKey: string }[];
};

export function expandRecurringRule(
  rule: RuleInput,
  windowStart: Date,
  windowEnd: Date
): AppointmentDTO[] {
  const cancelledKeys = new Set(rule.cancellations.map((c) => c.dateKey));
  const occurrences: AppointmentDTO[] = [];

  // Start from the rule's first occurrence
  const cursor = new Date(rule.startsOn);

  // Fast-forward to the window start
  while (cursor < windowStart) {
    cursor.setDate(cursor.getDate() + 7);
  }

  const limitEnd = rule.endsOn
    ? new Date(Math.min(rule.endsOn.getTime(), windowEnd.getTime()))
    : windowEnd;

  while (cursor <= limitEnd) {
    const dateKey = cursor.toISOString().split("T")[0];
    if (!cancelledKeys.has(dateKey)) {
      const endsAt = new Date(cursor.getTime() + rule.durationMin * 60 * 1000);
      occurrences.push({
        id: `rec:${rule.id}:${dateKey}`,
        title: rule.title,
        startsAt: cursor.toISOString(),
        endsAt: endsAt.toISOString(),
        customer: rule.customer,
        createdById: rule.createdById,
        isRecurring: true,
        recurringRuleId: rule.id,
        occurrenceDate: dateKey,
      });
    }
    cursor.setDate(cursor.getDate() + 7);
  }

  return occurrences;
}
