"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppointmentDTO } from "@/types";

interface Props {
  appointment: AppointmentDTO;
  onDelete: (id: string) => void;
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const from = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const to = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} - ${from} to ${to}`;
}

export default function AppointmentCard({ appointment, onDelete }: Props) {
  const [acting, setActing] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${appointment.title}"?`)) return;
    setActing(true);
    try {
      await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      onDelete(appointment.id);
    } finally {
      setActing(false);
    }
  }

  async function handleCancelOccurrence() {
    if (!appointment.recurringRuleId || !appointment.occurrenceDate) return;
    if (!confirm(`Cancel the ${appointment.occurrenceDate} occurrence of "${appointment.title}"?`)) return;
    setActing(true);
    try {
      await fetch(
        `/api/appointments/recurring/${appointment.recurringRuleId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dateKey: appointment.occurrenceDate }),
        }
      );
      onDelete(appointment.id);
    } finally {
      setActing(false);
    }
  }

  async function handleDeleteSeries() {
    if (!appointment.recurringRuleId) return;
    if (!confirm(`Delete the entire "${appointment.title}" series? This cannot be undone.`)) return;
    setActing(true);
    try {
      await fetch(`/api/appointments/recurring/${appointment.recurringRuleId}`, {
        method: "DELETE",
      });
      onDelete(`series:${appointment.recurringRuleId}`);
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-zinc-900 truncate">{appointment.title}</p>
          {appointment.isRecurring && (
            <span className="shrink-0 text-xs bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-medium">
              Weekly
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          {formatRange(appointment.startsAt, appointment.endsAt)}
        </p>
        <p className="text-sm text-zinc-600 mt-1">
          <span className="text-zinc-400 text-xs mr-1">Customer</span>
          {appointment.customer}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5">
        {appointment.isRecurring ? (
          <>
            <Link
              href={`/appointments/recurring/${appointment.recurringRuleId}/edit`}
              className="text-xs rounded-lg border border-zinc-300 text-zinc-600 px-2 py-1 hover:bg-zinc-50 transition-colors"
            >
              Edit series
            </Link>
            <button
              onClick={handleCancelOccurrence}
              disabled={acting}
              className="text-xs rounded-lg border border-amber-200 text-amber-600 px-2 py-1 hover:bg-amber-50 disabled:opacity-50 transition-colors"
            >
              {acting ? "..." : "Cancel date"}
            </button>
            <button
              onClick={handleDeleteSeries}
              disabled={acting}
              className="text-xs rounded-lg border border-red-200 text-red-500 px-2 py-1 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Delete series
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            disabled={acting}
            className="text-xs rounded-lg border border-red-200 text-red-500 px-2 py-1 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {acting ? "..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
