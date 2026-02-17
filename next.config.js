/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages deployment
  output: 'standalone',
  
  // Experimental for edge runtime with Neon
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  
  // Image optimization config
  images: {
    domains: [],
  },
}

module.exports = nextConfig
