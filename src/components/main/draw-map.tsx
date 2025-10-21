'use client'

import { produce } from 'immer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Path } from '@/features/main/map-fetching/types'
import { useGeolocation } from '@/hooks/main/useGeolocation'

/** kakao 전역 선언 (TS 에러 방지) */
declare global {
  interface Window {
    kakao: any
  }
}

/** Kakao Drawing getData() 포인트: x=lng, y=lat */
interface DrawingPoint {
  x: number
  y: number
}

/** 오버레이 타입(Polyline)만 저장할거라 any로 두되, 필요하면 좁혀도 됨 */
type OverlayAny = any

export default function DrawMap({
  onSavePath,
}: {
  onSavePath: (path: Path) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null) // kakao.maps.Map
  const managerRef = useRef<any | null>(null) // kakao.maps.drawing.DrawingManager

  /** 그려진 오버레이(수동 관리용) - 화면에 갯수 표기나 디버깅 위해 상태로 둠 */
  const [overlays, setOverlays] = useState<OverlayAny[]>([])

  /** SDK 로딩 여부 */
  const [sdkReady, setSdkReady] = useState(false)

  /** 지오로케이션 훅 */
  const { coords, loading, requestOnce } = useGeolocation()

  const DEFAULT_CENTER = useMemo(
    () => ({ lat: 37.570447943807935, lng: 126.97934326898095 }),
    []
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && window.kakao?.maps) {
      setSdkReady(true)
      return
    }

    const iv = setInterval(() => {
      if (window.kakao?.maps) {
        clearInterval(iv)
        setSdkReady(true)
      }
    }, 100)
    return () => clearInterval(iv)
  }, [])

  const initMapAndDrawing = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return

    const el = containerRef.current
    let mounted = true

    window.kakao.maps.load(() => {
      if (!mounted) return
      if (!el) return

      const rect = containerRef.current!.getBoundingClientRect()
      if (rect.height === 0) return

      const centerLat = coords?.latitude ?? DEFAULT_CENTER.lat
      const centerLng = coords?.longitude ?? DEFAULT_CENTER.lng

      const mapOption = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 3,
      }
      const map = new window.kakao.maps.Map(containerRef.current!, mapOption)
      mapRef.current = map

      // DrawingManager (Polyline 전용)
      const { OverlayType } = window.kakao.maps.drawing
      const drawingOptions = {
        map,
        drawingMode: [OverlayType.POLYLINE],
        guideTooltip: ['draw', 'drag', 'edit'],
        polylineOptions: {
          draggable: true,
          removable: true,
          editable: true,
          strokeColor: '#39f',
          strokeOpacity: 0.9,
          strokeStyle: 'solid',
          strokeWeight: 4,
          hintStrokeStyle: 'dash',
          hintStrokeOpacity: 0.5,
        },
      }

      const manager = new window.kakao.maps.drawing.DrawingManager(
        drawingOptions
      )
      managerRef.current = manager

      // 그리기 종료시 오버레이를 immer로 기록
      window.kakao.maps.event.addListener(manager, 'drawend', (data: any) => {
        const overlay = data?.target
        if (!overlay) return
        setOverlays(prev =>
          produce(prev, draft => {
            draft.push(overlay)
          })
        )
      })
    })

    return () => {
      mounted = false
    }
  }, [sdkReady, coords, DEFAULT_CENTER])

  useEffect(() => {
    initMapAndDrawing()
  }, [initMapAndDrawing])

  useEffect(() => {
    if (!containerRef.current) return
    if (!mapRef.current || !window.kakao) return

    const el = containerRef.current
    const map = mapRef.current
    const initialCenter = map.getCenter()

    const obs = new ResizeObserver(entries => {
      const entry = entries[0]
      const target = (entry?.target ?? el) as HTMLElement

      if (!document.body.contains(target)) return

      const rect = target.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      mapRef.current.relayout()
      mapRef.current.setCenter(initialCenter)
    })

    obs.observe(el)
    return () => obs.disconnect()
  }, [sdkReady])

  /** 좌표 바뀌면 중심 이동 */
  useEffect(() => {
    if (!coords || !mapRef.current || !window.kakao) return
    const center = new window.kakao.maps.LatLng(
      coords.latitude,
      coords.longitude
    )
    mapRef.current.panTo(center)
  }, [coords])

  /** 폴리라인 그리기 시작 */
  const startPolylineDraw = () => {
    if (!managerRef.current || !window.kakao) return
    const { OverlayType } = window.kakao.maps.drawing
    managerRef.current.select(OverlayType.POLYLINE)
  }

  const extractPolylineData = () => {
    if (!managerRef.current || !window.kakao) return
    const { OverlayType } = window.kakao.maps.drawing
    const data = managerRef.current.getData()
    const lines: Array<{ points: DrawingPoint[]; options: any }> =
      data[OverlayType.POLYLINE] ?? []

    const raw = lines[0]?.points ?? []
    if (raw.length < 2) {
      console.warn('[extractPolylineData] not enough points:', raw)
      return
    }
    const path: Path = raw
      .map(point => ({ lat: Number(point?.y), lng: Number(point?.x) }))
      .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng))

    if (path.length < 2) {
      console.warn('[extractPolylineData] invalid numeric points:', raw)
      return
    }

    onSavePath(path)
    return path
  }

  return (
    <div className="z-50">
      <div className="space-y-3">
        {/* 지도 컨테이너 */}
        <div
          ref={containerRef}
          className="relative w-[360px] h-[300px] border border-gray-200 rounded-lg"
        >
          <div className="absolute z-10 flex gap-1 justify-center inset-x-0 top-1">
            <button
              type="button"
              onClick={startPolylineDraw}
              className="px-2 py-1.5 rounded-md border text-sm bg-white hover:bg-gray-100 hover:cursor-pointer"
            >
              경로 그리기 시작
            </button>

            <button
              type="button"
              onClick={extractPolylineData}
              className="px-2 py-1.5 rounded-md border text-sm bg-white hover:bg-gray-100 hover:cursor-pointer"
            >
              경로 저장
            </button>
          </div>
          <button
            type="button"
            onClick={requestOnce}
            disabled={loading}
            className="z-10 absolute right-1 bottom-1 px-2 py-1.5 rounded-md border text-sm bg-black text-white hover:bg-gray-500 hover:cursor-pointer disabled:opacity-50"
          >
            현재 위치
          </button>
        </div>
      </div>
    </div>
  )
}
