'use client'

import '@/styles/common/theme.css'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FeatHeaderProps {
  title: string
  onBack?: () => void
}

export default function FeatHeader({ title, onBack }: FeatHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky mb-6 top-0 z-50 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between h-14 px-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="text-[var(--color-basic-300)]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-normal text-[var(--color-basic-400)]">
          {title}
        </h1>
      </div>
    </header>
  )
}
