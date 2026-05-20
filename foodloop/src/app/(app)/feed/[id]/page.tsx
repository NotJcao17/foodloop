import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { MapPin, Calendar, Tag } from "lucide-react";
import { ExpiryBadge } from "@/components/feature/ExpiryBadge";
import { ClaimButton } from "@/components/feature/ClaimButton";
import { PostStatusActions } from "@/components/feature/PostStatusActions";
import { formatDate, getInitials } from "@/lib/utils";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(id, name, avatar_url, user_type)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const isOwner = post.user_id === user.id;

  // Check if current user has claimed this post
  const { data: myClaimData } = await supabase
    .from("claims")
    .select("id")
    .eq("post_id", id)
    .eq("claimer_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const { data: existingClaim } = await supabase
    .from("claims")
    .select("id, claimer_id")
    .eq("post_id", id)
    .eq("status", "active")
    .maybeSingle();

  const profile = post.profiles as any;

  return (
    <div className="pb-4">
      {/* Back button */}
      <div className="mb-4">
        <a href="/feed" className="text-sm text-primary font-medium hover:underline">← Volver al feed</a>
      </div>

      {/* Image */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
        <Image src={post.image_url} alt={post.title} fill className="object-cover" sizes="600px" />
        <div className="absolute top-3 right-3">
          <ExpiryBadge date={post.expiration_date} />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-bold text-text leading-tight">{post.title}</h1>
          <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${
            post.offer_type === "free" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {post.offer_type === "free" ? "Gratuito" : `Simbólico${post.price_amount ? ` $${post.price_amount}` : ""}`}
          </span>
        </div>

        {post.description && (
          <p className="text-muted text-sm mb-3 leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-col gap-1.5 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Caduca: <strong className="text-text">{formatDate(post.expiration_date)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{post.pickup_location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="capitalize">{profile?.user_type === "cafeteria" ? "Cafetería" : "Estudiante"}</span>
          </div>
        </div>
      </div>

      {/* Publisher */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border mb-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Publicado por</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
            {profile?.avatar_url
              ? <Image src={profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
              : getInitials(profile?.name ?? "U")}
          </div>
          <div>
            <p className="font-semibold text-text text-sm">{profile?.name}</p>
            <p className="text-xs text-muted capitalize">{profile?.user_type === "cafeteria" ? "Cafetería" : "Estudiante"}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isOwner ? (
        <PostStatusActions postId={post.id} currentStatus={post.status} />
      ) : (
        <ClaimButton
          postId={post.id}
          postStatus={post.status}
          myClaimId={myClaimData?.id ?? null}
          existingClaimId={existingClaim?.id ?? null}
        />
      )}
    </div>
  );
}
