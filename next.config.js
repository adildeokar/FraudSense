/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fewer stale chunk / timeout issues in dev (large dashboard bundles)
  onDemandEntries: {
    maxInactiveAge: 90 * 1000,
    pagesBufferLength: 10,
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.output = {
        ...config.output,
        chunkLoadTimeout: 180000,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
