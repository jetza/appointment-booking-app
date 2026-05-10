"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import type { RecurringRuleDTO } from "@/types";

function toLocalDateTimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalDateValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export default function EditRecurringPage() {
  const router = useRouter();
  const { ruleId } = useParams<{ ruleId: string }>();

  const [rule, setRule] = useState<RecurringRuleDTO | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [seriesEndsOn, setSeriesEndsOn] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/appointments/recurring/${ruleId}`)
      .then((r) => r.json())
      .then((data: RecurringRuleDTO) => {
        setRule(data);
        setTitle(data.title);
        setCustomer(data.customer);
        const start = new Date(data.startsOn);
        const end = new Date(start.getTime() + data.durationMin * 60000);
        setStartsAt(toLocalDateTimeValue(start));
        setEndsAt(toLocalDateTimeValue(end));
        setSeriesEndsOn(data.endsOn ? toLocalDateValue(new Date(data.endsOn)) : "");
      })
      .catch(() => setLoadError("Failed to load recurring series."));
  }, [ruleId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (end <= start) {
      setSaveError("End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/recurring/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          customer: customer.trim(),
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          endsOn: seriesEndsOn ? new Date(seriesEndsOn).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "Failed to save changes");
      } else {
        router.push("/appointments");
        router.refresh();
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-lg">
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  if (!rule) {
    return <div className="text-center py-16 text-zinc-400">Loading…</div>;
  }

  const selectedDayName = startsAt ? DAY_NAMES[new Date(startsAt).getDay()] : "";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Edit Recurring Series</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Changes apply to all occurrences of this series.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-zinc-700 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <input
            id="customer"
            type="text"
            required
            maxLength={120}
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="block text-sm font-medium text-zinc-700 mb-1">
              First occurrence starts <span className="text-red-500">*</span>
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endsAt" className="block text-sm font-medium text-zinc-700 mb-1">
              Ends at <span className="text-red-500">*</span>
            </label>
            <input
              id="endsAt"
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedDayName && (
          <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
            Repeats every <strong>{selectedDayName}</strong>.
          </p>
        )}

        <div>
          <label htmlFor="seriesEndsOn" className="block text-sm font-medium text-zinc-700 mb-1">
            Series ends on <span className="text-zinc-400">(optional — leave blank for indefinite)</span>
          </label>
          <input
            id="seriesEndsOn"
            type="date"
            value={seriesEndsOn}
            onChange={(e) => setSeriesEndsOn(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
