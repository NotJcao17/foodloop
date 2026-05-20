import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const iconMap = {
  claim:         <Bell className="w-5 h-5 text-primary" />,
  message:       <MessageSquare className="w-5 h-5 text-secondary" />,
  expiring_soon: <Clock className="w-5 h-5 text-danger" />,
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark all as read
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-4">Notificaciones</h1>
      {!notifs || notifs.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Bell className="w-12 h-12 text-muted/30 mb-3" />
          <p className="text-text font-semibold">Sin notificaciones</p>
          <p className="text-muted text-sm mt-1">Te avisaremos cuando alguien reclame tu publicación</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map(n => (
            <Link
              key={n.id}
              href={n.type === "message" ? `/chat/${n.reference_id}` : n.reference_id ? `/feed/${n.reference_id}` : "/feed"}
              className={`flex items-start gap-3 p-3 rounded-2xl border transition hover:shadow-sm ${
                n.read ? "bg-white border-border" : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">{iconMap[n.type as keyof typeof iconMap]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text leading-tight">{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-muted/70 mt-1">{formatDate(n.created_at)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
