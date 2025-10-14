import type { SpotifyTrack } from '@/types'

// 따로 env파일에 안옮겨도 됌! Spotify가 항상 고정적으로 사용하는 API 주소임
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

export async function searchSpotifyTracks(query: string, accessToken: string) {
  const response = await fetch(
    `${SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) throw new Error('Spotify API 요청 실패')

  const data = await response.json()

  return data.tracks.items.map((track: SpotifyTrack) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    albumImage: track.album.images?.[0]?.url ?? '',
    previewUrl: track.preview_url,
  }))
}
