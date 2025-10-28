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
  const modalRef = useRef<HTMLDivElement | null>(null)
  const firstFieldRef = useRef<HTMLInputElement | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string>('')

  const [query, setQuery] = useState(initialTitle)
  const [results, setResults] = useState<SpotifySimplifiedTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<SpotifySimplifiedTrack | null>(null)
  const [bpm, setBpm] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    lastFocusedElementRef.current = document.activeElement as HTMLElement | null
    previousOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (firstFieldRef.current) {
      firstFieldRef.current.focus()
    }

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose(false)
        return
      }

      if (e.key === 'Tab') {
        const node = modalRef.current
        if (!node) return
        const focusable = Array.from(
          node.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter(
          el =>
            !el.hasAttribute('disabled') &&
            el.tabIndex !== -1 &&
            !el.getAttribute('aria-hidden')
        )

        if (focusable.length === 0) {
          e.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (e.shiftKey) {
          if (active === first || !node.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflowRef.current
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (mode === 'edit' && initialTitle) {
      setQuery(initialTitle)
    }
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

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={tw(`
        fixed inset-0 z-[9999] flex justify-center items-start md:items-center
        p-4
        bg-black/30 backdrop-blur-xs
      `)}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose(false)
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="musicModalTitle"
        className={tw(`
          flex flex-col
          w-[400px] max-w-[90%] max-h-[80vh]
          overflow-y-auto
          bg-white border border-transparent rounded-lg shadow-lg
          text-gray-800
        `)}
      >
        <form
          onSubmit={handleSearch}
          className={tw(`
            flex flex-col
            w-full min-h-0
            p-5 gap-4
          `)}
        >
          <div
            className={tw(`
              flex items-center justify-between
              w-full
            `)}
          >
            <h2
              id="musicModalTitle"
              className={tw(`
                text-gray-800 text-lg font-semibold
              `)}
            >
              {mode === 'add' ? '러닝곡 추가' : '러닝곡 수정'}
            </h2>

            <button
              type="button"
              onClick={() => onClose(false)}
              aria-label="닫기 버튼"
              className={tw(`
                flex items-center justify-center
                w-[24px] h-[24px]
                bg-transparent border border-transparent rounded-md
                text-gray-400 text-base
                hover:text-gray-600
                cursor-pointer
              `)}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div
            className={tw(`
              flex flex-col
              gap-4
              min-h-0
            `)}
          >
            <div
              className={tw(`
                flex flex-col md:flex-row
                gap-2
              `)}
            >
              <div
                className={tw(`
                  flex items-center
                  flex-1 gap-2 px-3 py-2
                  border border-gray-300 rounded-lg
                  bg-white
                  text-gray-700 text-sm
                  cursor-text
                `)}
              >
                <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  ref={firstFieldRef}
                  type="search"
                  placeholder="검색어 입력 (노래, 가수명)"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className={tw(`
                    flex-1
                    bg-transparent border border-transparent outline-none
                    text-gray-700 text-sm
                  `)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={tw(`
                  flex items-center justify-center
                  px-4 py-2 w-full md:w-auto
                  bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] disabled:bg-gray-400
                  border border-transparent rounded-lg shadow-none
                  text-white text-sm font-medium
                  cursor-pointer
                `)}
              >
                검색
              </button>
            </div>

            <div
              className={tw(`
                flex flex-col
                max-h-[240px] overflow-y-auto
                border border-gray-200 rounded-lg
                bg-white
                text-gray-800 text-base
              `)}
            >
              {loading ? (
                <div
                  className={tw(`
                    flex justify-center items-center
                    py-12
                    text-gray-500 text-sm
                  `)}
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <p
                  className={tw(`
                    py-10 text-center
                    text-gray-400 text-sm
                  `)}
                >
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
                        className={tw(`
                          flex items-center
                          w-full gap-3 p-3
                          rounded-md
                          ${
                            selected?.id === track.id
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          }
                          text-left
                          cursor-pointer
                        `)}
                      >
                        <img
                          src={track.album_image}
                          alt={`${track.title} 앨범 이미지`}
                          className={tw(`
                            flex-shrink-0
                            w-12 h-12
                            rounded-md
                            object-cover
                          `)}
                        />
                        <div
                          className={tw(`
                            flex-1 min-w-0
                            text-gray-900 text-base
                          `)}
                        >
                          <p className="truncate text-gray-900 text-[15px] font-medium">
                            {track.title}
                          </p>
                          <p className="truncate text-gray-600 text-sm font-normal">
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

            <label
              className={tw(`
                flex flex-col
                text-gray-700 text-sm font-normal
              `)}
            >
              BPM (선택 입력)
              <input
                type="number"
                min="0"
                max="300"
                placeholder="예: 160"
                value={bpm}
                onChange={e =>
                  setBpm(e.target.value ? Number(e.target.value) : '')
                }
                className={tw(`
                  mt-1 px-3 py-2
                  border border-gray-300 rounded-md
                  bg-white
                  text-gray-700 text-sm
                  outline-none
                `)}
              />
            </label>
          </div>

          <button
            ref={confirmButtonRef}
            id="confirm-button"
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={tw(`
              flex items-center justify-center
              w-full px-4 py-2
              bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] disabled:bg-gray-400
              border border-transparent rounded-md shadow-none
              text-white text-sm font-medium
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
      </div>
    </div>
  )
}
