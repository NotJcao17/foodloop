"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/feed",     icon: Home,       label: "Inicio" },
  { href: "/new-post", icon: PlusCircle, label: "Publicar" },
  { href: "/ai",       icon: Sparkles,   label: "IA Chef" },
  { href: "/profile",  icon: User,       label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                active ? "text-primary font-semibold" : "text-muted"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
