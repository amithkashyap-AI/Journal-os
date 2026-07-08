import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rpos/types", "@rpos/validation", "@rpos/workflow-engine"],
};

export default nextConfig;
