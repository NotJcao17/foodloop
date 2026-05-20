import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ExpiryBadge } from "./ExpiryBadge";
import { getInitials } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post & { profiles: { name: string; avatar_url: string | null; user_type: string } | null };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/feed/${post.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
        <div className="relative h-44 w-full bg-gray-100">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 600px"
          />
          <div className="absolute top-2 right-2">
            <ExpiryBadge date={post.expiration_date} />
          </div>
          {post.offer_type === "symbolic" && (
            <div className="absolute top-2 left-2">
              <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Precio simbólico
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-text text-base leading-tight line-clamp-1">{post.title}</h3>
          {post.description && (
            <p className="text-muted text-sm mt-0.5 line-clamp-2">{post.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                {post.profiles?.avatar_url ? (
                  <Image src={post.profiles.avatar_url} alt="" width={24} height={24} className="rounded-full object-cover" />
                ) : (
                  getInitials(post.profiles?.name ?? "?")
                )}
              </div>
              <span className="text-xs text-muted truncate max-w-[120px]">{post.profiles?.name ?? "Usuario"}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{post.pickup_location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
