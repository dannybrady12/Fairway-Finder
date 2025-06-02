/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {
    // ✅ This enables the /app directory (required for dynamic routing)
    appDir: true,
  },
};

module.exports = nextConfig;
