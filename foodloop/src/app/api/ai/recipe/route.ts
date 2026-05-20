import { NextRequest, NextResponse } from "next/server";
import { generateRecipe } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory rate limit: 10 requests per user per minute
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 10;
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= limit) return true;
  rateLimitMap.set(userId, [...timestamps, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: "Límite de solicitudes alcanzado. Espera un momento." }, { status: 429 });
  }

  const { ingredients } = await req.json();
  if (!ingredients?.trim()) {
    return NextResponse.json({ error: "Debes ingresar ingredientes" }, { status: 400 });
  }

  try {
    const recipe = await generateRecipe(ingredients);
    return NextResponse.json(recipe);
  } catch (e: any) {
    console.error("Gemini recipe error:", e?.message ?? e);
    return NextResponse.json({ error: "Error al generar la receta: " + (e?.message ?? "desconocido") }, { status: 500 });
  }
}
