import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  /* config options here */
  images: {
    remotePatterns: [
      
      {
        protocol: "https",
        hostname: "ztwvwqurbdwuoneoqmlm.supabase.co",
      },
    ],
  },
};

export default nextConfig;
