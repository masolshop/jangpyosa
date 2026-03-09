/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000',
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://meet.jit.si https://8x8.vc",
              "style-src 'self' 'unsafe-inline' https://meet.jit.si https://8x8.vc",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://meet.jit.si https://8x8.vc",
              "connect-src 'self' https://meet.jit.si https://8x8.vc wss://*.jitsi.net wss://*.meet.jit.si",
              "media-src 'self' https: blob:",
              "frame-src 'self' https://meet.jit.si https://8x8.vc",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
