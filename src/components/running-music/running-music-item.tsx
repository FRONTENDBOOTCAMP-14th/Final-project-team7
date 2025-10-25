'use client'

import { Check, ExternalLink, Loader2, Pause, Pin, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { togglePinnedMusic } from '@/lib/api/running-music/get-music-status'
import { supabase } from '@/lib/supabase/supabase-client'
import type { MusicLink } from '@/types/running-music/spotify'
import { tw } from '@/utils/tw'

interface RunningMusicItemProps {
  music: MusicLink
  isPinned: boolean
  disableActions?: boolean
  isSelectable?: boolean
  isSelected?: boolean
  mode?: 'normal' | 'edit' | 'delete'
  onSelect?: (id: string) => void
  onReload: () => Promise<void>
  audioRef: React.RefObject<HTMLAudioElement | null>
  playingId: string | null
  setPlayingIdAction: (id: string | null) => void
}

export default function RunningMusicItem({
  music,
  isPinned,
  disableActions = false,
  isSelectable = false,
  isSelected = false,
  mode = 'normal',
  onSelect,
  onReload,
  audioRef,
  playingId,
  setPlayingIdAction,
}: RunningMusicItemProps) {
  const [pinLoading, setPinLoading] = useState(false)

  const handlePreview = () => {
    if (!music.preview_url) {
      toast.error('미리듣기를 지원하지 않습니다')
      return
    }

    if (playingId === music.id) {
      audioRef.current?.pause()
      setPlayingIdAction(null)
      return
    }

    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(music.preview_url)
    audioRef.current = audio
    audio.play()
    setPlayingIdAction(music.id)
    audio.addEventListener('ended', () => setPlayingIdAction(null))
  }

  const handlePin = async () => {
    try {
      setPinLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const updated = await togglePinnedMusic(user.id, music.id)
      toast.success(
        updated.is_pinned
          ? '대표 러닝곡으로 설정되었습니다'
          : '대표 러닝곡이 해제되었습니다'
      )
      await onReload()
    } catch {
      toast.error('대표곡 변경 중 오류가 발생했습니다')
    } finally {
      setPinLoading(false)
    }
  }

  return (
    <section
      className={tw(
        `
        flex 
        items-center justify-between py-3 px-2
        border-[var(--color-basic-100)]
        `,
        isSelectable &&
          (mode === 'delete'
            ? 'hover:bg-red-100 cursor-pointer'
            : 'hover:bg-blue-100 cursor-pointer'),
        isSelected && (mode === 'delete' ? 'bg-red-50' : 'bg-blue-50')
      )}
      onClick={() => isSelectable && onSelect?.(music.id)}
    >
      <div className="flex items-center flex-1 min-w-0 gap-3">
        <img
          src={music.album_image ?? '/placeholder.png'}
          alt={music.title}
          className="flex-shrink-0 w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="overflow-hidden font-medium text-gray-900 text-ellipsis line-clamp-2 break-words">
              {music.title}
            </p>

            {!isSelectable && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  handlePin()
                }}
                disabled={pinLoading}
                className={`flex-shrink-0 ${
                  isPinned ? 'text-blue-500' : 'text-gray-400'
                } transition cursor-pointer`}
              >
                {pinLoading ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <Pin
                    className={`w-4 h-4 ${isPinned ? 'fill-blue-500' : ''}`}
                  />
                )}
              </button>
            )}
          </div>
          <p className="truncate text-sm text-gray-600">{music.artist}</p>
        </div>
      </div>
      {!disableActions && !isSelectable && (
        <div className="flex items-center flex-shrink-0 gap-3 pl-4">
          {music.preview_url ? (
            <button
              onClick={e => {
                e.stopPropagation()
                handlePreview()
              }}
              className={tw(`
                flex items-center justify-center w-8 h-8 
                rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 cursor-pointer
              `)}
            >
              {playingId === music.id ? (
                <Pause className="w-3 h-3" aria-label="일시정지" />
              ) : (
                <Play className="w-3 h-3" aria-label="재생하기" />
              )}
            </button>
          ) : (
            <a
              href={music.external_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={tw(`
                flex items-center justify-center w-8 h-8 
                rounded-full bg-green-50 border border-green-300 hover:bg-green-100 text-green-600
              `)}
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
      {isSelectable && (
        <div
          className={tw(
            'flex items-center justify-center w-6 h-6 rounded-full border-2',
            isSelected
              ? mode === 'delete'
                ? 'bg-red-500 border-red-500'
                : 'bg-blue-500 border-blue-500'
              : 'border-gray-300 bg-white'
          )}
        >
          {isSelected && (
            <Check
              className={tw(
                'w-3 h-3',
                mode === 'delete' ? 'text-white' : 'text-white'
              )}
            />
          )}
        </div>
      )}
    </section>
  )
}
