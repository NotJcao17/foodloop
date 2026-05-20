import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { LogoutButton } from "@/components/feature/LogoutButton";
import { ProfileEditForm } from "@/components/feature/ProfileEditForm";
import { ExpiryBadge } from "@/components/feature/ExpiryBadge";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: posts }, { count: savedCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("posts").select("id, title, status, expiration_date, image_url").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "delivered"),
  ]);

  const activePosts = (posts ?? []).filter(p => p.status === "available" || p.status === "claimed");
  const historyPosts = (posts ?? []).filter(p => p.status === "delivered" || p.status === "expired");

  const statusLabel: Record<string, string> = {
    available: "Disponible", claimed: "Reclamado", delivered: "Entregado ✅", expired: "Expirado"
  };
  const statusColor: Record<string, string> = {
    available: "text-primary", claimed: "text-amber-600", delivered: "text-green-600", expired: "text-muted"
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0">
            {profile?.avatar_url
              ? <Image src={profile.avatar_url} alt="" width={64} height={64} className="object-cover" />
              : getInitials(profile?.name ?? "U")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">{profile?.name}</h1>
            <p className="text-sm text-muted capitalize">{profile?.user_type === "cafeteria" ? "🍽️ Cafetería" : "🎓 Estudiante"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Publicaciones", value: posts?.length ?? 0 },
            { label: "Alimentos salvados", value: savedCount ?? 0 },
            { label: "Activas", value: activePosts.length },
          ].map(stat => (
            <div key={stat.label} className="text-center bg-background rounded-xl p-2">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        <ProfileEditForm profile={profile} userId={user.id} />
        <LogoutButton />
      </div>

      {/* Active posts */}
      {activePosts.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-text mb-2">Publicaciones activas</h2>
          <div className="flex flex-col gap-2">
            {activePosts.map(p => (
              <Link key={p.id} href={`/feed/${p.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border hover:shadow-sm transition">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={p.image_url} alt={p.title} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{p.title}</p>
                  <p className={`text-xs mt-0.5 ${statusColor[p.status]}`}>{statusLabel[p.status]}</p>
                </div>
                <ExpiryBadge date={p.expiration_date} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {historyPosts.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-text mb-2">Historial</h2>
          <div className="flex flex-col gap-2">
            {historyPosts.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border opacity-70">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={p.image_url} alt={p.title} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{p.title}</p>
                  <p className={`text-xs mt-0.5 ${statusColor[p.status]}`}>{statusLabel[p.status]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
