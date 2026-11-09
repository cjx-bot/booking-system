import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 严格模式：React 19 下开发期双调用 effect，用来暴露副作用问题
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
}

export default nextConfig
