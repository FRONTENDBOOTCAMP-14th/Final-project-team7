// add-record-button.tsx
'use client'

import { Loader2, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import type { CourseOption, RunningRecord } from '@/types/running-record/index'

// 모달 컴포넌트 지연 로딩 (클라이언트 전용)
const AddRecordModal = dynamic(() => import('./add-record-modal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-lg p-6 bg-white shadow-md text-gray-700">
        <Loader2 className="w-5 h-5 mx-auto text-blue-600 animate-spin" />
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
    // 모달 언마운트 직후 트리거 버튼으로 포커스 복원 (접근성)
    requestAnimationFrame(() => buttonRef.current?.focus())
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-gray-700 hover:bg-gray-50 transition cursor-pointer"
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
