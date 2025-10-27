import type {
  SpotifySearchResponse,
  SpotifySimplifiedTrack,
} from '@/types/running-music/spotify'

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

async function getSpotifyAccessToken(): Promise<string> {
  const res = await fetch('/api/spotify-token', { cache: 'no-store' })
  if (!res.ok) throw new Error('Spotify Access Token 요청 실패')
  const data = await res.json()
  return data.access_token
}

export async function searchSpotifyTracks(
  query: string
): Promise<SpotifySimplifiedTrack[]> {
  const token = await getSpotifyAccessToken()
  const res = await fetch(
    `${SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=30`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) throw new Error('Spotify 검색 요청 실패')

  const data: SpotifySearchResponse = await res.json()

  return data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album_image: track.album.images?.[0]?.url ?? '',
    preview_url: track.preview_url,
    external_url: track.external_urls.spotify,
  }))
}
