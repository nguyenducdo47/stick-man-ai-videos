import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-video-studio/validation', '@ai-video-studio/shared'],
};

export default nextConfig;
