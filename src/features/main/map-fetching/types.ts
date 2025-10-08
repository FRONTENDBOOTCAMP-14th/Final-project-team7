export type GeoPermission = 'granted' | 'denied' | 'prompt' | 'unknown'

export interface GeoOptions {
  enableHighAccuracy?: boolean
  timeout?: number // ms
  maximumAge?: number // ms
}

export interface GeoCoords {
  latitude: number
  longitude: number
  accuracy?: number
}
