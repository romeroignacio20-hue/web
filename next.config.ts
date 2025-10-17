import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@upstash/redis']
  },
  env: {
    STATS_PASSWORD: process.env.STATS_PASSWORD,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  }
};

export default nextConfig;
