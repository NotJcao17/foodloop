"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Cargar conteo inicial
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)
      .then(({ count }) => setCount(count ?? 0));

    // Suscripción realtime
    const channel = supabase
      .channel("notifs-" + userId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => setCount((c) => c + 1))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <Link href="/notifications" className="relative p-2">
      <Bell className="w-6 h-6 text-text" />
      {count > 0 && (
        <span className="absolute top-1 right-1 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
