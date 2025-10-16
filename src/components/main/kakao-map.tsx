'use client'

import Script from 'next/script'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Path } from '@/features/main/map-fetching/types.ts'

export default function KakaoMap({ coordData }: { coordData: Path }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const polylineRef = useRef<kakao.maps.Polyline | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).kakao?.maps) {
      setSdkReady(true)
    } else {
      const w = window as any
      if (w?.kakao?.maps) setSdkReady(true)
      else {
        const iv = setInterval(() => {
          if (w?.kakao?.maps) {
            clearInterval(iv)
            setSdkReady(true)
          }
        }, 50)
        return () => clearInterval(iv)
      }
    }
  }, [])

  const avgSource = useMemo(
    () =>
      coordData.length > 1 &&
      coordData[0].lat === coordData.at(-1)!.lat &&
      coordData[0].lng === coordData.at(-1)!.lng
        ? coordData.slice(0, -1)
        : coordData,
    [coordData]
  )

  const sum = avgSource.reduce(
    (acc, cur) => {
      acc.lat += cur.lat
      acc.lng += cur.lng
      return acc
    },
    { lat: 0, lng: 0 }
  )
  const count = Math.max(1, avgSource.length)
  const CenterLat = sum.lat / count
  const CenterLng = sum.lng / count

  const initMap = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return // 이미 초기화됨

    const start = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || rect.height === 0) return
      const mapOption = {
        center: new window.kakao.maps.LatLng(CenterLat, CenterLng),
        level: 7,
      }
      mapRef.current = new window.kakao.maps.Map(
        containerRef.current!,
        mapOption
      )
      setMapReady(true)
    }
    window.kakao.maps.load(start)
  }, [sdkReady])

  useEffect(() => {
    initMap()
  }, [initMap])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height
      if (h > 0 && !mapRef.current) {
        initMap() // 높이가 생기면 지도 생성 재시도
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [initMap])

  const pointsToPath = useCallback((points: Path) => {
    return points.map(p => new kakao.maps.LatLng(p.lat, p.lng))
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!mapReady) return
    if (!coordData?.length) return

    // 이전 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }
    const path = pointsToPath(coordData)

    const polyline = new kakao.maps.Polyline({
      map,
      path,
      strokeColor: '#00E500', // 필요 시 props로 빼기
      strokeOpacity: 0.9,
      strokeStyle: 'solid',
      strokeWeight: 4,
    })
    polylineRef.current = polyline

    if (path.length > 0) {
      const bounds = new kakao.maps.LatLngBounds()
      path.forEach(latlng => bounds.extend(latlng))
      map.setBounds(bounds)
    }

    // 클린업: coordData 변경/언마운트 시 기존 선 제거
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }
    }
  }, [coordData, mapReady, pointsToPath])

  return (
    <>
      {/* <Script
        id="kakao-maps-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=drawing`}
        strategy="afterInteractive"
        onReady={() => {
          setSdkReady(true)
        }}
      /> */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      />
    </>
  )
}
