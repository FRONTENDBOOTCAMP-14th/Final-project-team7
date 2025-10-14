'use client'

import { Loader2, Pencil } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import type { CourseOption, RunningRecord } from '../types'

// 동적 기능 이용해서, 모달 컴포넌트 지연 로딩(lazy load)
// 모달을 열 때만, modal.tsx 파일을 불러옴
const EditRecordModal = dynamic(() => import('./edit-record-modal'), {
  ssr: false, // 모달 -> 클라이언트 전용 UI 이므로 false로 설정
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-700">
        <Loader2 className="animate-spin text-blue-600" />
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
        <Pencil className="w-4 h-4" aria-hidden="true" />
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
