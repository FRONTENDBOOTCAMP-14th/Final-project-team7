'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { SORT } from '../../constants/main/sort'

type SortKey = keyof typeof SORT

export function SortDropdown() {
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('LATEST')

  const handleSort = (key: SortKey) => {
    setSort(key)
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-between w-32 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span>{SORT[sort]}</span>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1 text-sm text-gray-700">
            {Object.entries(SORT).map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => handleSort(key as SortKey)}
                  className={`w-full text-left px-4 py-2 hover:bg-green-50 ${
                    sort === key
                      ? 'font-semibold text-[var(--color-point-100)]'
                      : ''
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
