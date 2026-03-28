/** @type {import('next').NextConfig} */
// Misma regla que Next: sin basePath en raíz, o un solo segmento con /
// NEXTAUTH_BASEPATH en .env usa ${BASEPATH}; en Vercel/CD ese texto NO se sustituye y rompe el cliente.
const rawBasePath = process.env.BASEPATH
const basePath =
  rawBasePath == null || rawBasePath === ''
    ? undefined
    : rawBasePath.startsWith('/')
      ? rawBasePath
      : `/${rawBasePath}`
const nextAuthBasePath = basePath ? `${basePath}/api/auth` : '/api/auth'

const nextConfig = {
  // Sin output: 'export' para que funcionen API routes (NextAuth) en Vercel
  basePath,
  env: {
    NEXT_PUBLIC_NEXTAUTH_BASEPATH: nextAuthBasePath
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
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
