/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://departmental-api.onrender.com/:path*'
      }
    ]
  }
}

export default nextConfig;
