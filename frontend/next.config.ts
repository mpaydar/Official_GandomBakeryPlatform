import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
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
