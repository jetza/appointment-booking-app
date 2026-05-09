"use client";

import { useState } from "react";
import type { AppointmentDTO } from "@/types";

interface Props {
  appointment: AppointmentDTO;
  onDelete: (id: string) => void;
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const from = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const to = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${from} – ${to}`;
}

export default function AppointmentCard({ appointment, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${appointment.title}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      onDelete(appointment.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-900 truncate">{appointment.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{formatRange(appointment.startsAt, appointment.endsAt)}</p>
        <p className="text-sm text-zinc-600 mt-1">
          <span className="text-zinc-400 text-xs mr-1">Customer</span>
          {appointment.customer}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 text-xs rounded-lg border border-red-200 text-red-500 px-2 py-1 hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        {deleting ? "…" : "Delete"}
      </button>
    </div>
  );
}
