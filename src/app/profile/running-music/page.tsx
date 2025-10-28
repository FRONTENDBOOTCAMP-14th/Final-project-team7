'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import RunningMusicList from '@/components/running-music/running-music-list'
import RunningMusicModal from '@/components/running-music/running-music-modal'
import {
  getMusicList,
  getMusicStatus,
} from '@/lib/api/running-music/get-music-status'
import { supabase } from '@/lib/supabase/supabase-client'
import type { MusicLink } from '@/types/running-music/spotify'
import { tw } from '@/utils/tw'

export default function RunningMusicPage() {
  const [musicList, setMusicList] = useState<MusicLink[]>([])
  const [pinned, setPinned] = useState<MusicLink | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const loadMusic = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMusicList([])
      setPinned(null)
      setIsLoading(false)
      return
    }

    try {
      const [list, pinnedTrack] = await Promise.all([
        getMusicList(user.id),
        getMusicStatus(user.id),
      ])

      const sortedList = list.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return a.title.localeCompare(b.title)
      })

      setMusicList(sortedList)
      setPinned(pinnedTrack)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMusic()

    const audio = audioRef.current
    return () => {
      if (audio) audio.pause()
    }
  }, [])

  if (isLoading) {
    return (
      <div
        className={tw(`
          flex flex-col items-center justify-center
          w-full max-w-[768px] mx-auto p-4
          min-h-[50vh] gap-4
          bg-white text-gray-800
        `)}
        aria-busy="true"
        aria-live="polite"
      >
        <Loader2
          className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
          aria-hidden="true"
        />
        <p className="text-gray-500 text-base font-normal">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="px-[15px] py-5">
      <RunningMusicList
        pinned={pinned}
        musicList={musicList}
        onReload={loadMusic}
        audioRef={audioRef}
        playingId={playingId}
        setPlayingIdAction={setPlayingId}
        onAddMusic={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <RunningMusicModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          onReload={loadMusic}
        />
      )}
    </div>
  )
}
