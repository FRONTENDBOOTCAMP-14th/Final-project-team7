'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function KakaoMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  const initMap = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return // 이미 초기화됨

    window.kakao.maps.load(() => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect?.height === 0) {
        return
      }

      const mapOption = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      }

      mapRef.current = new window.kakao.maps.Map(
        containerRef.current!,
        mapOption
      )
    })
  }, [sdkReady])

  // SDK가 로드된 뒤에만 init 시도
  useEffect(() => {
    initMap()
  }, [initMap])

  return (
    <>
      <Script
        id="kakao-maps-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=drawing`}
        strategy="afterInteractive"
        onLoad={() => {
          // console.log('[KakaoMap] SDK loaded')
          setSdkReady(true)
        }}
      />
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 140,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      />
    </>
  )
}
