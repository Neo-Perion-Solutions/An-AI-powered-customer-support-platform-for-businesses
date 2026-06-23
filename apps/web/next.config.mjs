/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@neo/shared', '@neo/ui', '@neo/ai'],
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
};
export default nextConfig;
