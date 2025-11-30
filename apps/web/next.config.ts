import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable the sync dynamic APIs warning for Auth0 compatibility
    dynamicIO: false,
  },
  turbopack: {
    // Turbopack is now stable, configure it here instead of experimental.turbo
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Consider fixing these instead.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
