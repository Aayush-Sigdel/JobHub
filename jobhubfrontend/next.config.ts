import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackMemoryLimit: 2048,
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
