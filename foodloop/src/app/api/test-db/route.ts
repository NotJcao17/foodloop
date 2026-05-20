import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Test conexión básica
  const { data: tables, error: tablesError } = await supabase
    .from("profiles")
    .select("count", { count: "exact", head: true });

  // 2. Test si el tipo user_type existe
  const { data: enumTest, error: enumError } = await supabase
    .rpc("test_enum" as any)
    .single()
    .then(() => ({ data: "n/a", error: null }))
    .catch(() => ({ data: null, error: null }));

  // 3. Test insert manual en profiles (simula el trigger)
  const testId = "00000000-0000-0000-0000-000000000001";
  const { error: insertError } = await supabase
    .from("profiles")
    .insert({ id: testId, name: "test", user_type: "student" as any });

  // 4. Limpieza
  await supabase.from("profiles").delete().eq("id", testId);

  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    profilesTableAccessible: !tablesError,
    profilesError: tablesError?.message ?? null,
    insertIntoProfilesWorks: !insertError,
    insertError: insertError?.message ?? null,
  });
}
