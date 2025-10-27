'use client'

import { Loader2, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'
import type { RunningRecord } from '@/types/running-record/record-table-props'
import { tw } from '@/utils/tw'

const AddRecordModal = dynamic(() => import('./add-record-modal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="p-6 bg-white rounded-lg shadow-md text-gray-700">
        <Loader2 className="w-5 h-5 mx-auto text-blue-600 animate-spin" />
      </div>
    </div>
  ),
})

interface AddRecordButtonProps {
  onAddSuccess: (newRecord: RunningRecord) => void
}

export default function AddRecordButton({
  onAddSuccess,
}: AddRecordButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const router = useRouter()

  const handleOpen = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      toast.error('로그인 후 이용해주세요')
      router.push('/sign-in')
      return
    }

    setIsModalOpen(true)
  }

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
        className={tw(`
          flex items-center gap-2 px-3 py-2
          bg-white hover:bg-gray-50  
          rounded-lg border border-gray-300
          shadow-sm text-gray-700 text-sm
          transition cursor-pointer
        `)}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        기록 추가
      </button>

      {isModalOpen && (
        <AddRecordModal onClose={handleClose} onAddSuccess={onAddSuccess} />
      )}
    </>
  )
}
