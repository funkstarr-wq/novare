import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { securityHeaders } from './src/lib/securityHeaders'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const dev = process.env.NODE_ENV === 'development'
const https = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').startsWith('https://')

const nextConfig: NextConfig = {
  // Matches the current novare.com URLs (brief §7).
  trailingSlash: true,
  poweredByHeader: false,
  // Draft mode (live preview) pages must never be indexed (brief §8.3). The draft-mode cookie is
  // set by /api/preview/, so its presence marks a preview response.
  headers: async () => [
    // Security headers (brief §12). The admin rule comes second so its policy wins there.
    { source: '/:path*', headers: securityHeaders({ dev, https }) },
    { source: '/admin/:path*', headers: securityHeaders({ dev, https, admin: true }) },
    {
      source: '/:path*',
      has: [{ type: 'cookie', key: '__prerender_bypass' }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    },
  ],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const config = withPayload(nextConfig, { devBundleServerPackages: false })

// Payload sends `Critical-CH: Sec-CH-Prefers-Color-Scheme` (with Accept-CH and Vary) on every
// route, for the admin's colour scheme. Critical-CH makes a browser that didn't send the hint
// repeat the whole request, which costs every new visitor a round trip on the public site, so
// those headers go to the admin only.
const payloadHeaders = config.headers
config.headers = async () =>
  ((await payloadHeaders?.()) ?? []).map((rule) =>
    rule.source === '/:path*' && rule.headers.some((header) => header.key === 'Critical-CH')
      ? { ...rule, source: '/admin/:path*' }
      : rule,
  )

export default config
