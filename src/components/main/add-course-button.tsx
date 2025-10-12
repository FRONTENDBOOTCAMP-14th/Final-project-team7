'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import AddCourseModal from '@/components/main/add-course-modal'

export function AddCourseButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition cursor-pointer"
      >
        <Plus className="size-5" />
        <span className="text-sm">코스 추가하기</span>
      </button>

      {isOpen && <AddCourseModal onClose={() => setIsOpen(false)} />}
    </>
  )
}
