"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout}
      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-danger hover:bg-danger/5 rounded-xl transition mt-2">
      <LogOut className="w-4 h-4" /> Cerrar sesión
    </button>
  );
}
