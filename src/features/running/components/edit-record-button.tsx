'use client'

import { Pen } from 'lucide-react'
import { useRef, useState } from 'react'

import type { CourseOption } from '@/features/running/types/course'
import type { RunningRecord } from '@/features/running/types/record'

import EditRecordModal from './edit-record-modal'

interface EditRecordButtonProps {
  courses: CourseOption[]
  record: RunningRecord
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}

export default function EditRecordButton({
  courses,
  record,
  onUpdateSuccess,
  onDeleteSuccess,
}: EditRecordButtonProps) {
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
        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <Pen aria-hidden="true" className="w-4 h-4" />
        기록 수정
      </button>

      {isModalOpen && (
        <EditRecordModal
          courses={courses}
          record={record}
          onClose={handleClose}
          onUpdateSuccess={onUpdateSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
    </>
  )
}
