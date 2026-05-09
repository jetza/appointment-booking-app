"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { AppUser } from "@/types";

export default function Navbar({ user }: { user: AppUser }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 shadow-sm">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/appointments" className="text-base font-bold text-zinc-900 hover:text-blue-600 transition-colors">
            Bookings
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/appointments"
              className={`font-medium transition-colors ${
                pathname === "/appointments" ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Appointments
            </Link>
            <Link
              href="/appointments/new"
              className={`font-medium transition-colors ${
                pathname === "/appointments/new" ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              + New
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 hidden sm:block">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 transition-colors text-zinc-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
