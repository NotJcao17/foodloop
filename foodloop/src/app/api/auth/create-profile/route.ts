import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usa service role para bypassear RLS y crear el perfil tras el registro
export async function POST(req: NextRequest) {
  const { userId, name, user_type } = await req.json();
  if (!userId || !name) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("profiles").upsert(
    { id: userId, name, user_type: user_type ?? "student" },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
