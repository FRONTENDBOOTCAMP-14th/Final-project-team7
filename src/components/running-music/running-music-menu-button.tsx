'use client'

import { MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { tw } from '@/utils/tw'

interface RunningMusicMenuButtonProps {
  onAddMusic: () => void
  onEditMode: () => void
  onDeleteMode: () => void
}

export default function RunningMusicMenuButton({
  onAddMusic,
  onEditMode,
  onDeleteMode,
}: RunningMusicMenuButtonProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const toggleMenu = () => setOpen(prev => !prev)
  const closeMenu = () => setOpen(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="menu-list"
        aria-label="리스트 관리 메뉴 열기"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <ul
          id="menu-list"
          role="menu"
          className={tw(`
						absolute z-10 right-0
						w-[100px] bg-white border border-[var(--color-basic-100)] rounded-md shadow-md
						text-center`)}
        >
          <li role="none">
            <button
              role="menuitem"
              onClick={() => {
                onAddMusic()
                closeMenu()
              }}
              className="block w-full px-3 py-2 hover:bg-blue-50 text-sm text-blue-700 cursor-pointer"
            >
              추가
            </button>
          </li>

          <li role="none">
            <button
              role="menuitem"
              onClick={() => {
                onEditMode()
                closeMenu()
              }}
              className="block w-full px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
            >
              수정
            </button>
          </li>

          <li role="none">
            <button
              role="menuitem"
              onClick={() => {
                onDeleteMode()
                closeMenu()
              }}
              className="block w-full px-3 py-2 hover:bg-red-50 text-sm text-red-600 cursor-pointer"
            >
              삭제
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
