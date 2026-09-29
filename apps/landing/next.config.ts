/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config: any) => {
    config.watchOptions = {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
    };
    return config;
  },
  transpilePackages: ["@rpos/design-system"],
};

export default nextConfig;
