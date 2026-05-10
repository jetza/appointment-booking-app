import { redirect } from "next/navigation";
import { getSessionUserId, MOCK_USERS } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) redirect("/login");

  const appUser = { id: user.id, email: user.email, name: user.name };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar user={appUser} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
