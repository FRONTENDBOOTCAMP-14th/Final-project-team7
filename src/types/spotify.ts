// Spotify 표준 객체 타입

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyArtist {
  id: string
  name: string
  type: 'artist'
  uri: string
  external_urls: SpotifyExternalUrls
}

export interface SpotifyAlbum {
  id: string
  name: string
  release_date: string
  total_tracks: number
  images: SpotifyImage[]
  type: 'album'
  uri: string
  external_urls: SpotifyExternalUrls
}

export interface SpotifyTrack {
  id: string
  name: string
  type: 'track'
  uri: string
  duration_ms: number
  explicit: boolean
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  preview_url: string | null
  external_urls: SpotifyExternalUrls
}

export interface SpotifySearchResponse {
  tracks: {
    href: string
    items: SpotifyTrack[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
}
