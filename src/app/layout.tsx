import '@/styles/main.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import type { PropsWithChildren } from 'react'

import ClientLayout from '@/app/client-layout'
import Header from '@/components/common/header'
import Navigation from '@/components/common/navigation'

export const metadata: Metadata = {
  title: {
    template: '%s | Running11',
    default: 'Running11 - 러닝 기록 관리 서비스',
  },
  description: '러닝 기록을 추가하고 관리할 수 있는 러닝 전용 페이지입니다.',
  keywords: ['러닝', '기록', '러닝 코스', '운동', 'Running Record'],
  openGraph: {
    title: 'Running11 - 러닝 기록 관리 서비스',
    description: '코스를 추가하고 러닝 기록을 관리하세요.',
    url: 'https://running11.vercel.app/',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/preview.png',
        width: 200,
        height: 200,
        alt: '러닝 일레븐 사이트 로고',
      },
    ],
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  const kakaoSdkUrl =
    'https://dapi.kakao.com/v2/maps/sdk.js' +
    `?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}` +
    '&autoload=false' +
    '&libraries=drawing'

  return (
    <html lang="ko-KR">
      <Script
        id="kakao-maps-sdk"
        src={kakaoSdkUrl}
        strategy="afterInteractive"
      />
      <body className="md:max-w-[768px] mx-auto border-amber-700 border-4">
        <ClientLayout>
          <Header />
          <Navigation />
          <main>{children}</main>
        </ClientLayout>
      </body>
    </html>
  )
}
