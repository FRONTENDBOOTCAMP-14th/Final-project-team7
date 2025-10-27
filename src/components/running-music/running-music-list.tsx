'use client'

import { Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import RunningMusicItem from '@/components/running-music/running-music-item'
import RunningMusicMenuButton from '@/components/running-music/running-music-menu-button'
import RunningMusicModal from '@/components/running-music/running-music-modal'
import { removeMusic } from '@/lib/api/running-music/get-music-status'
import type { MusicLink } from '@/types/running-music/spotify'
import { tw } from '@/utils/tw'

interface RunningMusicListProps {
  pinned: MusicLink | null
  musicList: MusicLink[]
  onReload: () => Promise<void>
  audioRef: React.RefObject<HTMLAudioElement | null>
  playingId: string | null
  setPlayingIdAction: (id: string | null) => void
  onAddMusic: () => void
}

export default function RunningMusicList({
  pinned,
  musicList,
  onReload,
  audioRef,
  playingId,
  setPlayingIdAction,
  onAddMusic,
}: RunningMusicListProps) {
  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MusicLink | null>(null)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const listRef = useRef<HTMLUListElement | null>(null)

  const normalList = musicList
    .filter(music => music.id !== pinned?.id)
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'))

  const toggleSelect = useCallback(
    (id: string) => {
      if (mode === 'edit') {
        setSelectedIds([id])
      } else if (mode === 'delete') {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
      }
    },
    [mode]
  )

  useEffect(() => {
    if (mode === 'edit' || mode === 'delete') {
      const list = listRef.current
      if (!list) return
      const firstItem = list.querySelector<HTMLElement>('[data-music-item]')
      firstItem?.focus()
    }
  }, [mode])

  useEffect(() => {
    const list = listRef.current
    if (!list || mode === 'normal') return

    const items = Array.from(
      list.querySelectorAll<HTMLElement>('[data-music-item]')
    )

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null
      const currentIndex = activeEl ? items.indexOf(activeEl) : -1

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = items[currentIndex + 1] ?? items[0]
        next?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = items[currentIndex - 1] ?? items[items.length - 1]
        prev?.focus()
      } else if ((e.key === 'Enter' || e.key === ' ') && currentIndex >= 0) {
        e.preventDefault()
        const id = items[currentIndex].getAttribute('data-id')
        if (id) toggleSelect(id)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        const actionBtn = document.getElementById('action-button')
        if (actionBtn instanceof HTMLButtonElement) {
          actionBtn.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, toggleSelect])

  const handleCancel = () => {
    setMode('normal')
    setSelectedIds([])
  }
  const handleEditConfirm = () => {
    if (selectedIds.length !== 1)
      return toast.error('수정할 곡을 하나만 선택하세요')

    const target = musicList.find(m => m.id === selectedIds[0])
    if (!target) return

    setEditTarget(target)
    setIsModalOpen(true)
  }
  const handleModalClose = (isCompleted = false) => {
    setIsModalOpen(false)
    setEditTarget(null)
    if (isCompleted) {
      setMode('normal')
      setSelectedIds([])
      onReload()
    }
  }
  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) return toast.error('삭제할 곡을 선택하세요')
    if (!confirm(`${selectedIds.length}개의 곡을 삭제하시겠습니까?`)) return

    for (const id of selectedIds) await removeMusic(id)
    toast.success('선택한 러닝곡이 삭제되었습니다')
    setMode('normal')
    setSelectedIds([])
    await onReload()
  }
  return (
    <div className="relative space-y-6">
      <h2 className="border-b border-[var(--color-basic-100)] text-lg font-semibold text-gray-800">
        대표 러닝곡
      </h2>

      {pinned ? (
        <RunningMusicItem
          music={pinned}
          isPinned
          disableActions={false}
          audioRef={audioRef}
          playingId={playingId}
          setPlayingIdAction={setPlayingIdAction}
          onReload={onReload}
        />
      ) : (
        <p className="text-gray-400 text-sm">대표 러닝곡을 고정하세요</p>
      )}
      <div className="flex items-center justify-between mb-3 border-b border-[var(--color-basic-100)]">
        <div className=" flex items-center justify-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">러닝곡 리스트</h2>
          <div
            className={tw(`
            relative
            `)}
          >
            <button
              type="button"
              aria-label="정렬 안내"
              aria-expanded={isTooltipVisible}
              aria-describedby="sort tooltip"
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
              onFocus={() => setIsTooltipVisible(true)}
              onBlur={() => setIsTooltipVisible(false)}
              className="p-[2px] rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <Info className="w-4 h-4" aria-hidden="true" />
            </button>
            {isTooltipVisible && (
              <span
                id="sort-tooltip"
                role="tooltip"
                className={tw(`
                  absolute top-full left-0 z-50 
                  w-max max-w-[200px] px-3 py-2
                  bg-white border border-gray-200 rounded-lg shadow-md
                  text-[14px] text-gray-700
                `)}
              >
                <p>
                  러닝곡은 <strong>제목 기준</strong>으로,
                  <strong> ㄱ~ㅎ 순서</strong>로 정렬됩니다.
                </p>
                <p className="mt-1">
                  새로 <strong>추가</strong>하거나 <strong>수정</strong>된 곡도
                  자동으로 순서대로 재정렬 됩니다.
                </p>
              </span>
            )}
          </div>
        </div>
        <RunningMusicMenuButton
          onAddMusic={onAddMusic}
          onEditMode={() => {
            setMode('edit')
            setSelectedIds([])
          }}
          onDeleteMode={() => {
            setMode('delete')
            setSelectedIds([])
          }}
        />
      </div>

      {normalList.length === 0 ? (
        <p className="py-8 text-sm text-gray-400">러닝곡을 등록하세요</p>
      ) : (
        <ul ref={listRef}>
          {normalList.map(music => (
            <li
              key={music.id}
              data-music-item
              data-id={music.id}
              tabIndex={0}
              role="option"
              aria-selected={selectedIds.includes(music.id)}
              onClick={() => toggleSelect(music.id)}
              className={'cursor-pointer'}
            >
              <RunningMusicItem
                music={music}
                isPinned={false}
                isSelectable={mode !== 'normal'}
                isSelected={selectedIds.includes(music.id)}
                mode={mode}
                audioRef={audioRef}
                playingId={playingId}
                setPlayingIdAction={setPlayingIdAction}
                onReload={onReload}
              />
            </li>
          ))}
        </ul>
      )}
      {mode !== 'normal' && (
        <div className="sticky flex justify-end items-center gap-2 bottom-0 left-0 w-full pt-3 bg-white border-t border-gray-200">
          {mode === 'edit' ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 cursor-pointer"
              >
                취소
              </button>
              <button
                id="action-button"
                onClick={handleEditConfirm}
                disabled={selectedIds.length !== 1}
                className={tw(`
                  px-4 py-2 rounded-md bg-[var(--color-point-100)] text-white text-sm
                  ${
                    selectedIds.length !== 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'hover:bg-[var(--color-point-200)] cursor-pointer'
                  }
                `)}
              >
                수정하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer"
              >
                취소
              </button>
              <button
                id="action-button"
                onClick={handleDeleteConfirm}
                disabled={selectedIds.length === 0}
                className={tw(`
                px-4 py-2 rounded-md text-white text-sm ${
                  selectedIds.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                }
                `)}
              >
                삭제하기 ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      )}
      {isModalOpen && editTarget && (
        <RunningMusicModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onReload={onReload}
          mode="edit"
          targetMusicId={editTarget.id}
          initialTitle={editTarget.title}
        />
      )}
    </div>
  )
}
