import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect direct browser visits to manifest.json back to homepage.
      // Browsers that need it for PWA purposes send Accept: */* and won't be redirected
      // by the platform's static file handler before Next.js sees this — but this
      // handles the case where a user pastes the URL directly.
      {
        source: "/manifest.json",
        has: [{ type: "header", key: "accept", value: ".*text/html.*" }],
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
