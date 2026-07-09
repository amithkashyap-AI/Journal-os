import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rpos/types",
    "@rpos/validation",
    "@rpos/workflow-engine",
    "@rpos/design-system",
    "@rpos/ui",
  ],
};

export default nextConfig;
