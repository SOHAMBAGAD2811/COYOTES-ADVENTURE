/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Strip console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Tree-shake large packages that have barrel files
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'three'],
  },
};

module.exports = nextConfig;
