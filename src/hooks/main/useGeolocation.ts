import { useCallback, useMemo, useRef, useState } from 'react'

import type {
  GeoCoords,
  GeoOptions,
  GeoPermission,
} from '@/features/main/map-fetching/types'

// interface PositionLite {
//   latitude: number
//   longitude: number
//   accuracy: number
// }

// type NavigatorWithPermissions = Navigator & {
//   permissions?: {
//     query(args: { name: PermissionName }): Promise<PermissionStatus>
//   }
// }

export default function useGeolocation(defaultOptions: GeoOptions = {}) {
  const [coords, setCoords] = useState<GeoCoords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<GeoPermission>('unknown')

  const optionsRef = useRef<GeoOptions>({
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 30_000,
    ...defaultOptions,
  })

  const checkPermission = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
        setPermission('unknown')
        return 'unknown' as GeoPermission
      }

      const status = await navigator.permissions.query({ name: 'geolocation' })
      setPermission(status.state)
      return status.state as GeoPermission
    } catch {
      setPermission('unknown')
      return 'unknown' as GeoPermission
    }
  }, [])

  const requestOnce = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        throw new Error('Geolocation not supported in this environment.')
      }

      await checkPermission()

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            optionsRef.current
          )
        }
      )

      const { latitude, longitude, accuracy } = position.coords
      setCoords({ latitude, longitude, accuracy })
      return { latitude, longitude, accuracy }
    } catch (e: unknown) {
      let msg = 'Unknown geolocation error'
      if (e && typeof e === 'object') {
        const maybe = e as Partial<GeolocationPositionError> & {
          message?: string
        }
        if (maybe.message) msg = maybe.message
        else {
          switch (maybe.code) {
            case 1:
              msg = 'Permission denied'
              break
            case 2:
              msg = 'Position unavailable'
              break
            case 3:
              msg = 'Timeout'
              break
          }
        }
      }
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [checkPermission])

  return useMemo(
    () => ({ coords, error, loading, permission, requestOnce }),
    [coords, error, loading, permission, requestOnce]
  )
}
