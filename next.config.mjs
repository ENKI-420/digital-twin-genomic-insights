/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static generation completely
  output: 'standalone',
  trailingSlash: true,
  // Force all pages to be dynamic
  serverExternalPackages: ['@radix-ui/react-slot'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Remove X-Frame-Options to allow iframe embedding in Hyperdrive
          // Note: We'll handle this dynamically in middleware based on the request origin
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
