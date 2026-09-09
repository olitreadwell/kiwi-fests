import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  // better-sqlite3 is a native module; keep it external so the standalone
  // build traces it (with its .node binary) instead of trying to bundle it.
  serverExternalPackages: ['better-sqlite3', 'pg'],
};

export default nextConfig;
