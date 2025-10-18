import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remover 'standalone' para Vercel - usar configuración por defecto
  trailingSlash: false,
  serverExternalPackages: ['@upstash/redis'], // Actualizado según el warning
  env: {
    STATS_PASSWORD: process.env.STATS_PASSWORD,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  }
};

export default nextConfig;
