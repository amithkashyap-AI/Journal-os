import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.watchOptions = {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
    };
    return config;
  },
  transpilePackages: [
    "@rpos/types",
    "@rpos/validation",
    "@rpos/workflow-engine",
    "@rpos/design-system",
    "@rpos/ui",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "echarts",
      "echarts-for-react",
      "@tanstack/react-table",
      "@tanstack/react-query",
    ],
  },
};

export default nextConfig;
