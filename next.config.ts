import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/tutor/:moduleId/chat/:sessionId', destination: '/?tutor=:moduleId&chat=:sessionId' },
      { source: '/tutor/:moduleId', destination: '/?tutor=:moduleId' },
    ];
  },
};

export default nextConfig;
