import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 实验性功能
  experimental: {
    optimizeCss: true,
  },

  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1年缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 压缩配置
  compress: true,

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/(.*\\.(js|css|woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|webp|avif|svg|ico))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, webpack }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // Bundle 分析
      if (process.env.ANALYZE === 'true') {
        try {
          const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: '../bundle-analyzer-report.html',
            })
          );
        } catch (e) {
          console.warn('Bundle analyzer not available');
        }
      }
    }

    return config;
  },

  // 页面扩展名
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  }),

  // 生产环境配置
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    poweredByHeader: false,
    generateEtags: true,
  }),
};

export default nextConfig;
