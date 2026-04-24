import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    additionalData: `@use "@/styles/_variables.scss" as *;`,
  },
};

export default nextConfig;