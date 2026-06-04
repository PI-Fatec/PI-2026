import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    additionalData: `@use "@/styles/_variables.scss" as *;`,
  },
   async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://74.163.96.147:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;