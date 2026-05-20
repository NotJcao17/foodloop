import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/feature/PostCard";
import { FeedFilters } from "@/components/feature/FeedFilters";

interface SearchParams { filter?: string }

export default async function FeedPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { filter } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("posts")
    .select("*, profiles(id, name, avatar_url, user_type)")
    .eq("status", "available")
    .gte("expiration_date", today)
    .order("expiration_date", { ascending: true });

  if (filter === "expiring") {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    query = query.lte("expiration_date", tomorrow);
  } else if (filter === "free") {
    query = query.eq("offer_type", "free");
  }

  let { data: posts } = await query;

  // Filtro cafetería en JS (Supabase no soporta .eq en columnas de foreign table)
  if (filter === "cafeteria" && posts) {
    posts = posts.filter((p: any) => p.profiles?.user_type === "cafeteria");
  }

  return (
    <div>
      <FeedFilters active={filter} />
      {!posts || posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🥗</span>
          <p className="text-text font-semibold text-lg">No hay publicaciones disponibles</p>
          <p className="text-muted text-sm mt-1">¡Sé el primero en compartir algo hoy!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      )}
    </div>
  );
}
