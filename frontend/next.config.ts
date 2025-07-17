import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server external packages
  serverExternalPackages: [],

  // TypeScript configuration
  typescript: {
    // This will fail the build if there are type errors
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // This will fail the build if there are ESLint errors
    ignoreDuringBuilds: true,
  },

  // Performance optimizations
  compress: true,

  // PWA preparation (will be enhanced in M3)
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
