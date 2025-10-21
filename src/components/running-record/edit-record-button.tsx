'use client'

import { Loader2, Pencil } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import type { CourseOption } from '@/types/running-record/course'
import type { RunningRecord } from '@/types/running-record/record-table-props'

const EditRecordModal = dynamic(() => import('./edit-record-modal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="p-6 bg-white rounded-lg shadow-md text-gray-700">
        <Loader2 className="w-5 h-5 mx-auto animate-spin" aria-hidden="true" />
      </div>
    </div>
  ),
})

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
    requestAnimationFrame(() => buttonRef.current?.focus())
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-300 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] hover:bg-gray-50 text-gray-700 transition cursor-pointer"
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <Pencil className="w-4 h-4" aria-hidden="true" />
        수정하기
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
