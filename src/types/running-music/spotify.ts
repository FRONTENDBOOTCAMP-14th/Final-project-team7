export interface SpotifyArtist {
  name: string
}

export interface SpotifyImage {
  url: string
}

export interface SpotifyAlbum {
  images: SpotifyImage[]
}

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  preview_url: string | null
  external_urls: SpotifyExternalUrls
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

export interface SpotifySimplifiedTrack {
  id: string
  title: string
  artist: string
  album_image: string
  preview_url: string | null
  external_url: string
}

export interface MusicLink {
  id: string
  user_id: string
  title: string
  artist: string
  album_image: string | null
  preview_url: string | null
  external_url: string | null
  bpm: number | null
  is_pinned: boolean
}
