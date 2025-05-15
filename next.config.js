/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this to fix navigation issues
  async redirects() {
    return [
      {
        source: "/employees",
        destination: "/employees",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
