import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "./"),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // we want strict type checking
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
