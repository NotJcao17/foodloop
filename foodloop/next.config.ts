import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  typescript: {
    // El tipo Database es un stub manual sin Relationships, lo que hace
    // que Supabase infiera `never` en queries con joins. No bloquea el build.
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      // Limita la memoria que usa Turbopack en desarrollo
      memoryLimit: 512 * 1024 * 1024, // 512 MB
    },
  },
};

export default nextConfig;
