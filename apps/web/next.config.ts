import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Remove deprecated turbo config
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
  // Move serverComponentsExternalPackages to root level
  serverExternalPackages: ['@auth0/nextjs-auth0'],
  // Suppress warnings about dynamic usage
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Suppress specific warnings
  onDemandEntries: {
    // Suppress warnings about dynamic imports
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Webpack configuration to suppress warnings
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Suppress Auth0 warnings in development
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

export default nextConfig;
