import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude e2e directory from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    // Exclude e2e directory from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/e2e/**'],
    };
    return config;
  },
};

export default nextConfig;
