"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PostStatus } from "@/lib/types";

export function PostStatusActions({ postId, currentStatus }: { postId: string; currentStatus: PostStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: PostStatus) {
    setLoading(status);
    const supabase = createClient();
    await supabase.from("posts").update({ status }).eq("id", postId);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Gestionar publicación</p>
      <div className="flex flex-col gap-2">
        {currentStatus === "claimed" && (
          <>
            <button onClick={() => updateStatus("delivered")} disabled={loading === "delivered"}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition disabled:opacity-60">
              {loading === "delivered" ? "Guardando..." : "✅ Marcar como Entregado"}
            </button>
            <button onClick={() => updateStatus("available")} disabled={loading === "available"}
              className="w-full py-2.5 border border-border text-muted rounded-xl text-sm hover:border-primary/50 transition disabled:opacity-60">
              {loading === "available" ? "Guardando..." : "↩️ Volver a Disponible"}
            </button>
          </>
        )}
        {currentStatus === "available" && (
          <button onClick={() => updateStatus("expired")} disabled={loading === "expired"}
            className="w-full py-2.5 border border-danger/30 text-danger rounded-xl text-sm hover:bg-danger/5 transition disabled:opacity-60">
            {loading === "expired" ? "Guardando..." : "🗑️ Marcar como Expirado"}
          </button>
        )}
        {(currentStatus === "delivered" || currentStatus === "expired") && (
          <div className="text-center text-muted text-sm py-2">
            Esta publicación está {currentStatus === "delivered" ? "entregada ✅" : "expirada 🗑️"}
          </div>
        )}
      </div>
    </div>
  );
}
