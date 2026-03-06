import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.imweb.me',
      },
      {
        protocol: 'https',
        hostname: 'wbeyxjoqcwjbcuwvjrsa.supabase.co',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "invisible-company",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // dev 환경에서는 source map 업로드 비활성화 (Turbopack 충돌 방지 + 빌드 속도 개선)
  sourcemaps: {
    disable: isDev,
  },


  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: "/monitoring",

  // prod 환경에서만 widenClientFileUpload 활성화
  widenClientFileUpload: !isDev,

  webpack: isDev ? undefined : {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

