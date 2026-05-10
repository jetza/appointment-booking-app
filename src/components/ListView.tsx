"use client";

import type { AppointmentDTO } from "@/types";
import AppointmentCard from "./AppointmentCard";

interface Props {
  appointments: AppointmentDTO[];
  onDelete: (id: string) => void;
}

export default function ListView({ appointments, onDelete }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg">No appointments yet.</p>
        <p className="text-sm mt-1">
          Create your first one using the &ldquo;+ New&rdquo; button.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <AppointmentCard key={apt.id} appointment={apt} onDelete={onDelete} />
      ))}
    </div>
  );
}
