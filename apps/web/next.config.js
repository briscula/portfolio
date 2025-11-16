/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig