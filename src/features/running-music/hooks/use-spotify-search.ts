'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { searchSpotifyTracks } from '@/lib/api/spotify'

import type { SpotifyTrack } from '@/types'

interface UseSpotifySearchResult {
  results: SpotifyTrack[]
  loading: boolean
  error: string | null
  search: (query: string, accessToken: string) => Promise<void>
}

export function useSpotifySearch(): UseSpotifySearchResult {
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, accessToken: string) => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)

    try {
      const data = await searchSpotifyTracks(query, accessToken)
      setResults(data)

      if (data.length > 0) {
        toast.success(`${data.length}개의 곡을 달려서 가져왔어요!🎵`, {
          duration: 2000,
        })
      } else {
        toast('검색 결과가 없어요 😅', { icon: '🔍' })
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Spotify 검색 중 넘어져서 오류가 났어요!⚠️'
      setError(message)

      toast.error(message, {
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
