import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ChatPanel } from "@/components/feature/ChatPanel";
import { getInitials } from "@/lib/utils";

export default async function ChatPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: claim } = await supabase
    .from("claims")
    .select("*, posts(*, profiles(id, name, avatar_url)), profiles(id, name, avatar_url)")
    .eq("id", claimId)
    .single();

  if (!claim) notFound();

  const claimAny = claim as any;
  const post = claimAny.posts;
  const postOwner = post?.profiles;
  const claimer = claimAny.profiles;

  const isParticipant = user.id === claimAny.claimer_id || user.id === post?.user_id;
  if (!isParticipant) redirect("/feed");

  const otherPerson = user.id === claimAny.claimer_id ? postOwner : claimer;

  // Load initial messages
  const { data: initialMessages } = await supabase
    .from("messages")
    .select("*, profiles(id, name, avatar_url)")
    .eq("claim_id", claimId)
    .order("sent_at", { ascending: true });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-2xl p-3 border border-border shadow-sm mb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
          {otherPerson?.avatar_url
            ? <Image src={otherPerson.avatar_url} alt="" width={40} height={40} className="object-cover" />
            : getInitials(otherPerson?.name ?? "U")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-sm">{otherPerson?.name}</p>
          <p className="text-xs text-muted truncate">{post?.title}</p>
        </div>
        <a href={`/feed/${post?.id}`} className="text-xs text-primary hover:underline flex-shrink-0">
          Ver post
        </a>
      </div>

      <ChatPanel
        claimId={claimId}
        currentUserId={user.id}
        initialMessages={initialMessages ?? []}
      />
    </div>
  );
}
