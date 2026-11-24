import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ai-video-studio/validation',
    '@ai-video-studio/shared',
    '@ai-video-studio/animation-engine',
    '@ai-video-studio/stickman-renderer',
  ],
  webpack: (config) => {
    // Stickman-renderer must use the same R3F build as the app (React 19).
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-three/fiber': require.resolve('@react-three/fiber'),
      '@react-three/drei': require.resolve('@react-three/drei'),
    };
    return config;
  },
};

export default nextConfig;
