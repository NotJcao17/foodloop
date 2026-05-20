import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/feature/BottomNav";
import { NotificationBell } from "@/components/feature/NotificationBell";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-text text-lg">FoodLoop</span>
          </Link>
          <NotificationBell userId={user.id} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto pb-20 px-4 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
