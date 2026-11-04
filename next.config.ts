import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "1pxsk98h-3000.brs.devtunnels.ms",
        "localhost:3000",
        "*.brs.devtunnels.ms",
        "*.devtunnels.ms"
      ]
    }
  }
};

export default nextConfig;
