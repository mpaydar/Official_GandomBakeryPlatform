import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app (avoids picking up lockfiles outside frontend/)
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns:[
      {
        protocol:'https',
        hostname:'scontent-lga3-3.cdninstagram.com',
        port: '',
        pathname:'/**',
      }
    ]
  }
  
};

export default nextConfig;
