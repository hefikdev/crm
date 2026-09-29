import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "pino", "pino-pretty"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
