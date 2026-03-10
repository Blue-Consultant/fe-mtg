/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sin output: 'export' para que funcionen API routes (NextAuth) en Vercel
  basePath: process.env.BASEPATH,
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 4,
  },
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
}

export default nextConfig
