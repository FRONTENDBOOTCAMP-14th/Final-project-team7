import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 리액트 엄격 모드 활성화
  reactStrictMode: true,

  // ESLint 설정
  eslint: {
    // 빌드 시, 린팅 검사 결과 무시 설정
    // ignoreDuringBuilds: false,
  },

  // TypeScript 설정
  typescript: {
    // 빌드 시, 타입 검사 결과 무시 설정
    // ignoreBuildErrors: false,
  },
}

export default nextConfig
