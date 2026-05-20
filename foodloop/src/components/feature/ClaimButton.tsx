"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PostStatus } from "@/lib/types";

interface Props {
  postId: string;
  postStatus: PostStatus;
  myClaimId: string | null;
  existingClaimId: string | null;
}

export function ClaimButton({ postId, postStatus, myClaimId, existingClaimId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClaim() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("claims")
      .insert({ post_id: postId, claimer_id: user.id })
      .select("id")
      .single();

    if (error) {
      setError("No se pudo reclamar. Intenta de nuevo.");
      setLoading(false);
    } else {
      router.push(`/chat/${data.id}`);
    }
  }

  if (postStatus !== "available") {
    return (
      <div className="w-full py-3 bg-gray-100 rounded-2xl text-center text-muted font-medium text-sm">
        {postStatus === "claimed" ? "Ya fue reclamado" : postStatus === "delivered" ? "Ya fue entregado" : "Expirado"}
      </div>
    );
  }

  if (myClaimId) {
    return (
      <a href={`/chat/${myClaimId}`}
        className="block w-full py-3 bg-secondary text-white rounded-2xl text-center font-semibold text-sm hover:bg-primary transition">
        💬 Ir al chat de coordinación
      </a>
    );
  }

  if (existingClaimId && !myClaimId) {
    return (
      <div className="w-full py-3 bg-gray-100 rounded-2xl text-center text-muted font-medium text-sm">
        Ya fue reclamado por otra persona
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-danger text-sm text-center mb-2">{error}</p>}
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-60"
      >
        {loading ? "Reclamando..." : "🙋 Reclamar este alimento"}
      </button>
    </div>
  );
}
