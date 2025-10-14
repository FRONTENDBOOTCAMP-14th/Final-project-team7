'use client'

import { produce } from 'immer'
import Script from 'next/script'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

export default function DrawMap() {
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

  /** 지도 & DrawingManager 초기화 */
  const initMapAndDrawing = useCallback(() => {
    if (!sdkReady) return
    if (!window.kakao) return
    if (!containerRef.current) return
    if (mapRef.current) return // 이미 초기화됨

    window.kakao.maps.load(() => {
      // 컨테이너가 실제 크기를 가지는지 확인
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
  }, [sdkReady, coords, DEFAULT_CENTER])

  useEffect(() => {
    initMapAndDrawing()
  }, [initMapAndDrawing])

  useEffect(() => {
    if (!containerRef.current) return
    if (!mapRef.current || !window.kakao) return

    const center = mapRef.current.getCenter()
    const obs = new ResizeObserver(() => {
      // 컨테이너가 0이 아니면 레이아웃 갱신
      const rect = containerRef.current!.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      mapRef.current!.relayout()
      mapRef.current!.setCenter(center)
    })
    obs.observe(containerRef.current)

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

  /** DrawingManager.getData() → [{lat,lng}][][] 형태로 변환해서 반환 */
  const extractPolylineData = () => {
    if (!managerRef.current || !window.kakao) return
    const { OverlayType } = window.kakao.maps.drawing
    const data = managerRef.current.getData()
    const lines: Array<{ points: DrawingPoint[]; options: any }> =
      data[OverlayType.POLYLINE] ?? []

    // [[{lat,lng}, ...], ...] 형태
    const paths = lines.map(line =>
      line.points.map(point => ({ lat: point.y, lng: point.x }))
    )

    // TODO: Supabase 저장 로직 연결 가능
    return paths
  }

  /** 모든 오버레이 제거 + 현재 그리기 취소 (immer 사용) */
  const clearAll = () => {
    if (!managerRef.current) return

    // 현재 그리고 있는 동작 취소
    managerRef.current.cancel()

    // 라이브러리 레벨 제거 시도
    try {
      const { OverlayType } = window.kakao.maps.drawing
      managerRef.current.remove(OverlayType.POLYLINE)
    } catch {
      // (구버전/환경에 따라 remove가 없을 수 있으니) 수동 제거 fallback
    }

    // 수집해둔 overlay들도 안전하게 제거
    setOverlays(prev =>
      produce(prev, draft => {
        draft.forEach(overlay => {
          try {
            overlay.setMap(null)
          } catch {
            /* noop */
          }
        })
        // draft를 비우는 2가지 방법 중 택1
        // 1) 길이 0으로
        draft.length = 0
        // 2) return [] // (immer에서 반환으로 대체 가능)
      })
    )
  }

  return (
    <div className="z-50">
      {/* Kakao SDK */}
      <Script
        id="kakao-maps-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=drawing`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <div className="space-y-3">
        {/* 컨트롤 패널 */}
        {/* <div className="flex flex-wrap items-center gap-2">
          <span className="ml-auto text-xs text-gray-500">
            overlays: {overlays.length}
          </span>
        </div> */}

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
              경로 데이터 추출
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="px-2 py-1.5 rounded-md border text-sm bg-white hover:bg-gray-100 hover:cursor-pointer"
            >
              지우기
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
