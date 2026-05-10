"use client";

import { useState } from "react";
import type { AppointmentDTO } from "@/types";
import AppointmentCard from "./AppointmentCard";

interface Props {
  appointments: AppointmentDTO[];
  onDelete: (id: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarView({ appointments, onDelete }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map: "YYYY-MM-DD" -> appointments[]
  const dayMap = new Map<string, AppointmentDTO[]>();
  for (const apt of appointments) {
    const d = new Date(apt.startsAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = `${year}-${month}-${d.getDate()}`;
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(apt);
    }
  }

  const [selected, setSelected] = useState<AppointmentDTO[] | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");

  function selectDay(day: number) {
    const key = `${year}-${month}-${day}`;
    const apts = dayMap.get(key) ?? [];
    setSelected(apts);
    setSelectedLabel(`${MONTHS[month]} ${day}, ${year}`);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 transition-colors"
        >
          ← Prev
        </button>
        <h2 className="text-lg font-semibold text-zinc-800">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-500 mb-1">
        {DAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const hasApts = dayMap.has(key);
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              onClick={() => selectDay(day)}
              className={`relative rounded-lg p-2 text-sm text-center transition-colors
                ${isToday ? "bg-blue-600 text-white font-bold" : "hover:bg-zinc-100 text-zinc-700"}
                ${hasApts && !isToday ? "font-semibold ring-1 ring-blue-400" : ""}
              `}
            >
              {day}
              {hasApts && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-blue-500"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selected !== null && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold text-zinc-700 mb-3">{selectedLabel}</h3>
          {selected.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No appointments on this day.
            </p>
          ) : (
            <div className="space-y-3">
              {selected.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
