import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ai-video-studio/validation',
    '@ai-video-studio/shared',
    '@ai-video-studio/animation-engine',
  ],
};

export default nextConfig;
