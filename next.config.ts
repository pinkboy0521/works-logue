import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.dog.ceo",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    qualities: [25, 50, 75, 90, 100],
  },
  webpack: (config) => {
    // Yjsの重複インポートを防ぐ - ESM/TypeScript安全対応
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      yjs: require.resolve("yjs"),
    };

    return config;
  },
};

export default nextConfig;
