'use client'

import {
  ChevronRight,
  ExternalLink,
  Loader2,
  Music,
  Pause,
  Play,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { Tables } from '@/lib/supabase/database.types'
import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

type MusicLink = Tables<'music_links'>

export default function RunningMusicCard() {
  const router = useRouter()
  const [music, setMusic] = useState<MusicLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePreview = () => {
    if (!music?.preview_url) {
      toast.error('이 곡은 미리듣기 지원하지 않습니다')
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(music.preview_url)
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const fetchPinned = async () => {
      const { data } = await supabase
        .from('music_links')
        .select('*')
        .eq('is_pinned', true)
        .maybeSingle()
      setMusic(data ?? null)
      setLoading(false)
    }

    fetchPinned()
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const handleNavigate = () => {
    setIsNavigating(true)
    setTimeout(() => router.push('/running-music'))
  }

  if (loading)
    return (
      <section
        className={tw(`
          flex flex-col items-center w-full max-w-[363px] p-5 
          rounded-md border-2 border-[var(--color-basic-100)]
        `)}
      >
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span className="text-sm">대표 러닝곡 불러오는 중...</span>
      </section>
    )

  if (!music)
    return (
      <button
        onClick={handleNavigate}
        disabled={isNavigating}
        className={tw(`
          relative flex items-center justify-between w-full max-w-[363px] 
          p-5 rounded-md border-2 border-[var(--color-basic-100)] 
          cursor-pointer disabled:opacity-60
        `)}
      >
        <p className="text-base font-medium text-[var(--color-basic-300)]">
          대표 러닝곡이 없습니다
        </p>
        {isNavigating ? (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
    )

  return (
    <button
      type="button"
      onClick={handleNavigate}
      disabled={isNavigating}
      className={tw(
        'relative flex flex-col items-center w-full max-w-[363px] space-y-2 p-5 rounded-md border-2 border-[var(--color-basic-100)] cursor-pointer disabled:opacity-60'
      )}
    >
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-md">
          <Loader2
            className="flex items-center justify-center w-5 h-5 animate-spin text-blue-500"
            aria-label="로딩중"
          />
        </div>
      )}

      <span className="flex items-center justify-between w-full">
        러닝곡
        <ChevronRight className="w-4 h-4 text-gray-400" aria-label="이동하기" />
      </span>

      {music.album_image ? (
        <img
          src={music.album_image}
          alt={music.title}
          className="h-12 w-12 rounded-full overflow-hidden object-cover"
        />
      ) : (
        <Music className="mx-auto my-2 text-gray-400" />
      )}

      <p className="w-full max-w-[300px] font-semibold text-gray-800 line-clamp-2 break-words">
        {music.title}
      </p>
      <p className="w-full max-w-[300px] text-sm text-gray-500 line-clamp-2 break-words">
        {music.artist}
      </p>

      {music.preview_url ? (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            handlePreview()
          }}
          className={tw(`
            flex items-center gap-1 
            text-xs text-blue-600 hover:text-blue-800 
            cursor-pointer
          `)}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" aria-label="일시정지" />
          ) : (
            <Play className="w-5 h-5" aria-label="재생하기" />
          )}
        </button>
      ) : (
        <a
          href={music.external_url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={tw(`
            flex items-center justify-center w-8 h-8
            rounded-full bg-green-50 hover:bg-green-100 border border-green-300  text-green-600`)}
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" aria-label="스포티파이 링크" />
        </a>
      )}
    </button>
  )
}
