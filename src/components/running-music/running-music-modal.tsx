'use client'

import { Check, Loader2, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { createMusic } from '@/lib/api/running-music/get-music-status'
import { searchSpotifyTracks } from '@/lib/api/running-music/search-spotify-track'
import { supabase } from '@/lib/supabase/supabase-client'
import type { SpotifySimplifiedTrack } from '@/types/running-music/spotify'
import { tw } from '@/utils/tw'

interface RunningMusicModalProps {
  isOpen: boolean
  onClose: (isCompleted?: boolean) => void
  onReload: () => Promise<void>
  mode?: 'add' | 'edit'
  targetMusicId?: string | null
  initialTitle?: string
}

export default function RunningMusicModal({
  isOpen,
  onClose,
  onReload,
  mode = 'add',
  targetMusicId = null,
  initialTitle = '',
}: RunningMusicModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = useState(initialTitle)
  const [results, setResults] = useState<SpotifySimplifiedTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<SpotifySimplifiedTrack | null>(null)
  const [bpm, setBpm] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose(false)
        }
      }

      const handleOutsideClick = (e: MouseEvent) => {
        if (dialogRef.current && e.target === dialogRef.current) {
          onClose(false)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      dialog.addEventListener('click', handleOutsideClick)

      setTimeout(() => inputRef.current?.focus(), 0)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        dialog.removeEventListener('click', handleOutsideClick)
        document.body.style.overflow = ''
      }
    } else if (dialog.open) {
      dialog.close()
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (mode === 'edit' && initialTitle) setQuery(initialTitle)
  }, [mode, initialTitle])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setLoading(true)
      const data = await searchSpotifyTracks(query)
      setResults(data)
      if (data.length === 0) toast.info('검색 결과가 없습니다')
    } catch {
      toast.error('음악 검색 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!selected) {
      toast.error('음악을 선택해주세요')
      return
    }

    try {
      setSubmitting(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data: existing } = await supabase
        .from('music_links')
        .select('id, title, artist')
        .eq('user_id', user.id)
        .eq('title', selected.title)
        .eq('artist', selected.artist)
        .maybeSingle()

      if (existing && mode === 'add') {
        toast.error('이미 등록된 곡입니다')
        setSubmitting(false)
        return
      }

      if (existing && mode === 'edit' && existing.id !== targetMusicId) {
        toast.error('이미 같은 곡이 목록에 존재합니다')
        setSubmitting(false)
        return
      }

      if (mode === 'add') {
        await createMusic(user.id, {
          title: selected.title,
          artist: selected.artist,
          album_image: selected.album_image,
          preview_url: selected.preview_url,
          external_url: selected.external_url,
          bpm: bpm === '' ? null : Number(bpm),
          is_pinned: false,
        })
        toast.success('러닝곡이 추가되었습니다')
      } else if (mode === 'edit' && targetMusicId) {
        const { error } = await supabase
          .from('music_links')
          .update({
            title: selected.title,
            artist: selected.artist,
            album_image: selected.album_image,
            preview_url: selected.preview_url,
            external_url: selected.external_url,
            bpm: bpm === '' ? null : Number(bpm),
          })
          .eq('id', targetMusicId)

        if (error) throw new Error('수정 실패')
        toast.success('러닝곡이 수정되었습니다')
      }

      await onReload()
      onClose(true)
    } catch {
      toast.error('저장 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={tw(`
        fixed inset-0 z-9999 items-center justify-center
        mx-auto my-auto overflow-y-auto
        rounded-lg
      `)}
      onClose={() => onClose(false)}
      aria-labelledby="musicModalTitle"
    >
      <form
        method="dialog"
        onSubmit={handleSearch}
        className="flex flex-col max-w-[420px] max-h-[80%] gap-5 p-6"
      >
        <div className="flex items-center justify-between shrink-0">
          <h2
            id="musicModalTitle"
            className="text-lg font-semibold text-gray-800"
          >
            {mode === 'add' ? '러닝곡 추가' : '러닝곡 수정'}
          </h2>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="닫기 버튼"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-1 items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              placeholder="검색어 입력 (노래, 가수명)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] disabled:bg-gray-400 text-sm font-medium text-white cursor-pointer w-full md:w-auto"
          >
            검색
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto rounded-lg border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul role="listbox" aria-label="음악 검색 결과">
              {results.map(track => (
                <li key={track.id}>
                  <button
                    type="button"
                    role="option"
                    tabIndex={0}
                    aria-selected={selected?.id === track.id}
                    onClick={() => {
                      setSelected(track)
                      confirmButtonRef.current?.focus()
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(track)
                        confirmButtonRef.current?.focus()
                      }
                    }}
                    className={`flex items-center w-full gap-3 p-3 rounded-md ${
                      selected?.id === track.id
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    } text-left cursor-pointer`}
                  >
                    <img
                      src={track.album_image}
                      alt={`${track.title} 앨범 이미지`}
                      className="flex-shrink-0 w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {track.title}
                      </p>
                      <p className="truncate text-sm text-gray-600">
                        {track.artist}
                      </p>
                    </div>
                    {selected?.id === track.id && (
                      <Check className="flex-shrink-0 w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex flex-col text-sm text-gray-700">
          BPM (선택 입력)
          <input
            type="number"
            min="0"
            max="300"
            placeholder="예: 160"
            value={bpm}
            onChange={e => setBpm(e.target.value ? Number(e.target.value) : '')}
            className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 outline-none"
          />
        </label>
        <button
          ref={confirmButtonRef}
          id="confirm-button"
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className={tw(`
            flex items-center justify-center 
            px-4 py-2 
            bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] rounded-md disabled:bg-gray-400 
            text-sm text-white 
            cursor-pointer
          `)}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mode === 'add' ? (
            '추가하기'
          ) : (
            '수정하기'
          )}
        </button>
      </form>
    </dialog>
  )
}
