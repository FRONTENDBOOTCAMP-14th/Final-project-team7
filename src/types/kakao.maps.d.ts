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
      constructor(sw: LatLng, ne: LatLng)
      extend(latlng: LatLng): void
    }

    interface MapOptions {
      center: LatLng
      level?: number
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
    }

    interface MarkerOptions {
      map?: Map
      position: LatLng
      zIndex?: number
    }
    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
    }

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

    class Rectangle {
      constructor(
        options: {
          map?: Map
          bounds: LatLngBounds
        } & StrokeOptions & { fillColor?: string; fillOpacity?: number }
      )
      setMap(map: Map | null): void
    }

    class Circle {
      constructor(
        options: {
          map?: Map
          center: LatLng
          radius: number
        } & StrokeOptions & { fillColor?: string; fillOpacity?: number }
      )
      setMap(map: Map | null): void
    }

    class Polygon {
      constructor(
        options: {
          map?: Map
          path: LatLng[]
        } & StrokeOptions & { fillColor?: string; fillOpacity?: number }
      )
      setMap(map: Map | null): void
    }

    namespace drawing {
      const OverlayType: {
        readonly MARKER: 'MARKER'
        readonly POLYLINE: 'POLYLINE'
        readonly RECTANGLE: 'RECTANGLE'
        readonly CIRCLE: 'CIRCLE'
        readonly POLYGON: 'POLYGON'
      }

      type OverlayTypeKey = keyof typeof OverlayType

      type GuideTooltipMode = 'draw' | 'drag' | 'edit'

      interface DrawingManagerOptions {
        map: maps.Map
        drawingMode: Array<(typeof OverlayType)[keyof typeof OverlayType]>
        guideTooltip?: GuideTooltipMode[]
        markerOptions?: { draggable?: boolean; removable?: boolean }
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
        rectangleOptions?: {
          draggable?: boolean
          removable?: boolean
          editable?: boolean
          strokeColor?: string
          fillColor?: string
          fillOpacity?: number
          strokeOpacity?: number
          strokeStyle?: maps.StrokeOptions['strokeStyle']
          strokeWeight?: number
        }
        circleOptions?: {
          draggable?: boolean
          removable?: boolean
          editable?: boolean
          strokeColor?: string
          fillColor?: string
          fillOpacity?: number
          strokeOpacity?: number
          strokeStyle?: maps.StrokeOptions['strokeStyle']
          strokeWeight?: number
        }
        polygonOptions?: {
          draggable?: boolean
          removable?: boolean
          editable?: boolean
          strokeColor?: string
          fillColor?: string
          fillOpacity?: number
          hintStrokeStyle?: 'dash' | 'solid'
          hintStrokeOpacity?: number
          strokeOpacity?: number
          strokeStyle?: maps.StrokeOptions['strokeStyle']
          strokeWeight?: number
        }
      }

      // getData()가 반환하는 형태(사용한 필드만 축약 정의)
      type DrawnData = {
        [Overlay in (typeof OverlayType)[keyof typeof OverlayType]]: any[]
      }

      class DrawingManager {
        constructor(options: DrawingManagerOptions)
        cancel(): void
        select(type: (typeof OverlayType)[keyof typeof OverlayType]): void
        getData(): DrawnData
      }
    }
  }
}

export {}
