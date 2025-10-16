'use client'

import Script from 'next/script'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="kakao-maps-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=drawing`}
        strategy="afterInteractive"
      />
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
