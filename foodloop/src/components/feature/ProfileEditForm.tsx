"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export function ProfileEditForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ name }).eq("id", userId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const path = `${userId}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)}
          className="flex-1 py-2 border border-primary/50 text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition">
          Editar nombre
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="p-2 border border-border rounded-xl text-muted hover:border-primary/50 transition">
          <Camera className="w-5 h-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input value={name} onChange={e => setName(e.target.value)}
        className="flex-1 px-3 py-2 rounded-xl border border-primary text-sm focus:outline-none" />
      <button onClick={save} disabled={saving}
        className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-60">
        {saving ? "..." : "Guardar"}
      </button>
      <button onClick={() => setEditing(false)}
        className="px-3 py-2 border border-border text-muted rounded-xl text-sm">
        Cancelar
      </button>
    </div>
  );
}
