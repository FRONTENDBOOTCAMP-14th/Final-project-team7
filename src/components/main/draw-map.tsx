'use client'

import { produce } from 'immer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { Path } from '@/features/main/map-fetching/types'
import { useGeolocation } from '@/hooks/main/useGeolocation'
import { tw } from '@/utils/tw'

declare global {
  interface Window {
    kakao: any
  }
}

interface DrawingPoint {
  x: number
  y: number
}

type OverlayAny = any

export default function DrawMap({
  onSavePath,
}: {
  onSavePath: (path: Path) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any | null>(null)
  const managerRef = useRef<any | null>(null)
  const [, setOverlays] = useState<OverlayAny[]>([])
  const [sdkReady, setSdkReady] = useState(false)

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
  useEffect(() => {
    if (!coords || !mapRef.current || !window.kakao) return
    const center = new window.kakao.maps.LatLng(
      coords.latitude,
      coords.longitude
    )
    mapRef.current.panTo(center)
  }, [coords])

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
      toast.warning('경로를 생성하려면 점을 2개 이상 찍어주세요.')
      return
    }
    const path: Path = raw
      .map(point => ({ lat: Number(point?.y), lng: Number(point?.x) }))
      .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng))

    if (path.length < 2) {
      toast.warning('경로를 생성하려면 점을 2개 이상 찍어주세요.')
      return
    }

    onSavePath(path)
    return path
  }

  return (
    <div className="z-50">
      <div className="space-y-3">
        <div
          ref={containerRef}
          className="relative w-[360px] h-[300px] border border-gray-200 rounded-lg"
        >
          <div className="flex gap-1 justify-center absolute z-10 inset-x-0 top-1">
            <button
              type="button"
              onClick={startPolylineDraw}
              className="px-2 py-1.5 rounded-md border bg-white hover:bg-gray-100 text-sm hover:cursor-pointer"
            >
              경로 그리기 시작
            </button>

            <button
              type="button"
              onClick={extractPolylineData}
              className="px-2 py-1.5 rounded-md border bg-white hover:bg-gray-100 text-sm hover:cursor-pointer"
            >
              경로 저장
            </button>
          </div>
          <button
            type="button"
            onClick={requestOnce}
            disabled={loading}
            className={tw`
              absolute right-1 bottom-1 z-10
              px-2 py-1.5
              rounded-md border bg-black hover:bg-gray-500
              text-sm text-white 
              hover:cursor-pointer disabled:opacity-50
              `}
          >
            현재 위치
          </button>
        </div>
      </div>
    </div>
  )
}
