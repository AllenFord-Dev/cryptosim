import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // The main link opens the case study (a static page in /public); the app itself lives at /app.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/case.html" }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
