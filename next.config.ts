import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/tic-tac-toe',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
