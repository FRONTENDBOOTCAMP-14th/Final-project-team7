'use client'

import { Loader2, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import type { CourseOption } from '@/features/running/types/course'
import type { RunningRecord } from '@/features/running/types/record'

// 동적 기능 이용해서, 모달 컴포넌트 지연 로딩(lazy load)
// 모달을 열 때만, modal.tsx 파일을 불러옴
const AddRecordModal = dynamic(() => import('./add-record-modal'), {
  ssr: false, // 모달 -> 클라이언트 전용 UI 이므로 false로 설정
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-700">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    </div>
  ),
})

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
