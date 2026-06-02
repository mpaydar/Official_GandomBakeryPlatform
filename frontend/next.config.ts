import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent-lga3-3.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
