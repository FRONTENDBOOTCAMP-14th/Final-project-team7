'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { SORT, type SortKey } from '@/constants/main/sort'

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (key: SortKey) => void
}) {
  const [open, setOpen] = useState(false)

  const handleSort = (key: SortKey) => {
    onChange?.(key)
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(open => !open)}
        className="inline-flex items-center justify-between w-32 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <span>{SORT[value]}</span>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1 text-sm text-gray-700">
            {(Object.keys(SORT) as SortKey[]).map(key => (
              <li key={key}>
                <button
                  onClick={() => handleSort(key)}
                  className={`w-full text-left px-4 py-2 hover:bg-green-50 ${
                    value === key
                      ? 'font-semibold text-[var(--color-point-100)]'
                      : ''
                  }`}
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
