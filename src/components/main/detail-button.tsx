'use client'
import { Plus } from 'lucide-react'
// import { useState } from 'react'

// import CourseDetailModal from './course-detail-modal'

export default function DetailButton({ onOpen }: { onOpen: () => void }) {
  // const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex bg-[#424242] mb-5 py-[7px] px-2.5 gap-2.5 rounded-md items-center cursor-pointer"
      >
        <Plus className="text-white size-4" />
        <span className="text-white text-[12px]">상세보기</span>
      </button>
    </>
  )
}
