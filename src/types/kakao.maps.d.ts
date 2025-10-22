declare global {
  interface Window {
    kakao: typeof kakao
  }
}

declare namespace kakao {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng)
      extend(latlng: LatLng): void
    }

    interface MapOptions {
      center: LatLng
      level?: number
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      getCenter(): LatLng
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
      panTo(latlng: LatLng): void
      relayout(): void
      setBounds(bounds: kakao.maps.LatLngBounds): void
    }

    namespace event {
      function addListener(
        target: object,
        type: string,
        handler: (...args: unknown[]) => void
      ): void

      function addListener(
        target: kakao.maps.drawing.DrawingManager,
        type: 'drawend',
        handler: (evt: { target?: kakao.maps.Polyline }) => void
      ): void
    }

    function load(cb: () => void): void

    interface StrokeOptions {
      strokeColor?: string
      strokeOpacity?: number
      strokeStyle?:
        | 'solid'
        | 'shortdash'
        | 'shortdot'
        | 'shortdashdot'
        | 'shortdashdotdot'
        | 'dash'
        | 'dot'
        | 'dashdot'
        | 'longdash'
        | 'longdashdot'
        | 'longdashdotdot'
      strokeWeight?: number
    }

    class Polyline {
      constructor(
        options: {
          map?: Map
          path: LatLng[]
        } & StrokeOptions
      )
      setMap(map: Map | null): void
    }

    namespace drawing {
      const OverlayType: {
        readonly POLYLINE: 'polyline'
      }

      type OverlayTypeKey = keyof typeof OverlayType

      type GuideTooltipMode = 'draw' | 'drag' | 'edit'

      interface DrawingManagerOptions {
        map: maps.Map
        drawingMode: Array<(typeof OverlayType)[keyof typeof OverlayType]>
        guideTooltip?: GuideTooltipMode[]

        polylineOptions?: {
          draggable?: boolean
          removable?: boolean
          editable?: boolean
          strokeColor?: string
          hintStrokeStyle?: 'dash' | 'solid'
          hintStrokeOpacity?: number
          strokeOpacity?: number
          strokeStyle?: maps.StrokeOptions['strokeStyle']
          strokeWeight?: number
        }
      }

      interface DrawingPoint {
        x: number
        y: number
      }

      interface PolylineData {
        points: DrawingPoint[]
        options: unknown
      }

      // getData()가 반환하는 형태(사용한 필드만 축약 정의)
      interface DrawingData {
        polyline?: PolylineData[]
      }

      class DrawingManager {
        constructor(options: DrawingManagerOptions)
        cancel(): void
        select(type: (typeof OverlayType)[keyof typeof OverlayType]): void
        getData(): DrawingData
      }
    }
  }
}
