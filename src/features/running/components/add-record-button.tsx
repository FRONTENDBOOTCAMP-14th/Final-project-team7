'use client'

import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'

import type { CourseOption } from '@/features/running/types/course'
import type { RunningRecord } from '@/features/running/types/record'

import AddRecordModal from './add-record-modal'

interface AddRecordButtonProps {
  courses: CourseOption[]
  onAddSuccess: (newRecord: RunningRecord) => void
}

export default function AddRecordButton({
  courses,
  onAddSuccess,
}: AddRecordButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleOpen = () => setIsModalOpen(true)
  const handleClose = () => {
    setIsModalOpen(false)
    setTimeout(() => buttonRef.current?.focus(), 0)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        기록 추가
      </button>

      {isModalOpen && (
        <AddRecordModal
          courses={courses}
          onClose={handleClose}
          onAddSuccess={onAddSuccess}
        />
      )}
    </>
  )
}
