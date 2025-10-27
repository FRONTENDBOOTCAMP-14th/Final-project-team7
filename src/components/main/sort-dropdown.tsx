'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { SORT, type SortKey } from '@/constants/main/sort'
import { tw } from '@/utils/tw'

export default function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (key: SortKey) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const handleSort = (key: SortKey) => {
    onChange?.(key)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      <button
        type="button"
        tabIndex={0}
        onClick={() => setOpen(prev => !prev)}
        className={tw`
          relative z-20 inline-flex items-center justify-between
          w-32 px-4 py-2
          bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 
          cursor-pointer
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{SORT[value]}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={tw`
            absolute right-0 top-full z-10
            -mt-2 w-32
            bg-white border border-gray-200 rounded-lg shadow-lg
          `}
        >
          <ul className="py-1 text-sm text-gray-700" role="listbox">
            {(Object.keys(SORT) as SortKey[]).map(key => (
              <li key={key}>
                <button
                  onClick={() => handleSort(key)}
                  className={`w-full px-4 py-2 text-left hover:bg-green-50 cursor-pointer ${
                    value === key
                      ? 'font-semibold text-[var(--color-point-100)]'
                      : ''
                  }`}
                  role="option"
                  aria-selected={value === key}
                >
                  {SORT[key]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
