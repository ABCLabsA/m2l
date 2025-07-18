/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  transpilePackages: ['@monaco-editor/react'],
  images: {
    domains: ['picsum.photos', 'minio.guico.tech', 'api.dify.ai'],
    unoptimized: true
  },
  experimental: {
    largePageDataBytes: 128 * 1024, // 128KB
  },
  async rewrites() {
    return [
      {
        source: '/back/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:8100/api/:path*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/back/api/:path*',
        headers: [
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=300, max=1000',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
