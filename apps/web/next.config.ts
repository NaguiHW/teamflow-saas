import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@teamflow/types", "@teamflow/ui"],
};

export default nextConfig;
