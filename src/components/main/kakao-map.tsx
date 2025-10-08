'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function KakaoMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null) // 중복 초기화 방지

  const initMap = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return // 이미 초기화됨

    // SDK는 autoload=false이므로 load 콜백 안에서 초기화
    window.kakao.maps.load(() => {
      // 컨테이너 실제 크기 체크 (0이면 바로 리턴)
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect.height === 0) {
        // console.warn('[KakaoMap] container height is 0 — 스타일 확인 필요')
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
      // console.log('[KakaoMap] map initialized')
    })
  }, [sdkReady])

  // SDK가 로드된 뒤에만 init 시도
  useEffect(() => {
    initMap()
  }, [initMap])

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=drawing`}
        strategy="afterInteractive"
        onLoad={() => {
          // console.log('[KakaoMap] SDK loaded')
          setSdkReady(true)
        }}
      />
      {/* 부모가 접히지 않도록 높이 확정 */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 500,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      />
    </>
  )
}
