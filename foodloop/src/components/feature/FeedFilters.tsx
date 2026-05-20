"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const filters = [
  { value: "",         label: "Todos" },
  { value: "expiring", label: "⚡ Próximos a caducar" },
  { value: "free",     label: "🆓 Gratuitos" },
  { value: "cafeteria",label: "🍽️ Cafeterías" },
];

export function FeedFilters({ active }: { active?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("filter", value);
    else params.delete("filter");
    router.push("/feed?" + params.toString());
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap",
            (active ?? "") === f.value
              ? "bg-primary text-white"
              : "bg-white border border-border text-muted hover:border-primary/50"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
