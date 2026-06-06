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
        hostname: "linked-posts.routemisr.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ztwvwqurbdwuoneoqmlm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
