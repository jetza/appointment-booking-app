export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export interface AppointmentDTO {
  id: string;
  title: string;
  startsAt: string; // ISO string
  endsAt: string;   // ISO string
  customer: string;
  createdById: string;
}
