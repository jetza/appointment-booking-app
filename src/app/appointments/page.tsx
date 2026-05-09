"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListView from "@/components/ListView";
import CalendarView from "@/components/CalendarView";
import type { AppointmentDTO } from "@/types";

type View = "list" | "calendar";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [view, setView] = useState<View>("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setError(data.error ?? "Failed to load appointments");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Appointments</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{appointments.length} total</p>
        </div>
        <Link
          href="/appointments/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + New Appointment
        </Link>
      </div>

      {/* View toggle */}
      <div className="inline-flex rounded-lg border border-zinc-300 overflow-hidden">
        {(["list", "calendar"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors capitalize
              ${view === v ? "bg-blue-600 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-zinc-400">Loading…</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && view === "list" && (
        <ListView appointments={appointments} onDelete={handleDelete} />
      )}

      {!loading && !error && view === "calendar" && (
        <CalendarView appointments={appointments} onDelete={handleDelete} />
      )}
    </div>
  );
}
