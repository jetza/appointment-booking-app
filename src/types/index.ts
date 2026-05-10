export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export interface AppointmentDTO {
  id: string; // for recurring occurrences: "rec:{ruleId}:{YYYY-MM-DD}"
  title: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  customer: string;
  createdById: string;
  isRecurring: boolean;
  recurringRuleId?: string; // set for recurring occurrences
  occurrenceDate?: string; // YYYY-MM-DD, set for recurring occurrences
}

export interface RecurringRuleDTO {
  id: string;
  title: string;
  customer: string;
  durationMin: number;
  dayOfWeek: number;
  startsOn: string; // ISO
  endsOn: string | null;
  createdById: string;
}
