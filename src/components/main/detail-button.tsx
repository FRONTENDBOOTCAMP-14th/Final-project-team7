'use client'
import { Plus } from 'lucide-react'

import { tw } from '@/utils/tw'

export default function DetailButton({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className={tw`
          inline-flex items-center
          mb-5 py-[7px] px-2.5 gap-2.5
          bg-[var(--color-basic-300)] rounded-md
          cursor-pointer`}
      >
        <Plus className="size-4 text-white" />
        <span className="text-white text-[12px]">상세보기</span>
      </button>
    </>
  )
}
