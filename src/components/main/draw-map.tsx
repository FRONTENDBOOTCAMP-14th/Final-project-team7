'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useGeolocation } from '../../hooks/main/useGeolocation'

export default function DrawMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null) // 중복 초기화 방지

  const { coords, error, loading, permission, requestOnce } = useGeolocation()

  const DEFAULT_CENTER = { lat: 37.570447943807935, lng: 126.97934326898095 }

  const initMap = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return // 이미 초기화됨

    // SDK는 autoload=false이므로 load 콜백 안에서 초기화
    window.kakao.maps.load(() => {
      // 컨테이너 실제 크기 체크 (0이면 바로 리턴)
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect.height === 0) return

      const centerLat = coords?.latitude ?? DEFAULT_CENTER.lat
      const centerLng = coords?.longitude ?? DEFAULT_CENTER.lng

      const mapOption = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 3,
      }

      mapRef.current = new window.kakao.maps.Map(
        containerRef.current!,
        mapOption
      )
      // console.log('[KakaoMap] map initialized')
    })
  }, [sdkReady, coords])

  // SDK가 로드된 뒤에만 init 시도
  useEffect(() => {
    initMap()
  }, [initMap])

  useEffect(() => {
    if (!coords || !mapRef.current || !window.kakao) return
    const { latitude, longitude } = coords
    const center = new window.kakao.maps.LatLng(latitude, longitude)
    mapRef.current.panTo(center)
  }, [coords])

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
      <div
        ref={containerRef}
        className="relative w-[314px] h-[300px] border border-gray-200 rounded-lg"
      >
        <button
          type="button"
          onClick={requestOnce}
          disabled={loading}
          className="absolute top-3 left-1/2 -translate-x-1/2 
                  bg-black text-white text-sm font-medium 
                  px-2 py-2 rounded-md shadow-md z-10 w-24 text-[12px]
                  hover:bg-gray-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
        >
          현재 위치로 이동
        </button>
      </div>
    </>
  )
}
