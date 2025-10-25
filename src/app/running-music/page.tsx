'use client'

import { useEffect, useRef, useState } from 'react'

import RunningMusicList from '@/components/running-music/running-music-list'
import RunningMusicModal from '@/components/running-music/running-music-modal'
import {
  getMusicList,
  getMusicStatus,
} from '@/lib/api/running-music/get-music-status'
import { supabase } from '@/lib/supabase/supabase-client'
import type { MusicLink } from '@/types/running-music/spotify'

import '@/styles/main.css'

export default function RunningMusicPage() {
  const [musicList, setMusicList] = useState<MusicLink[]>([])
  const [pinned, setPinned] = useState<MusicLink | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const loadMusic = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

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
  }

  useEffect(() => {
    loadMusic()
    const audio = audioRef.current
    return () => {
      if (audio) audio.pause()
    }
  }, [])

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
