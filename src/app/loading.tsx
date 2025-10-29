import { Loader2 } from 'lucide-react'

import { tw } from '@/utils/tw'

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className={tw(`
        flex flex-col items-center justify-center
        w-full max-w-[768px] mx-auto px-4
        min-h-[50vh] gap-4
        bg-white text-gray-800
      `)}
    >
      <Loader2
        className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
        aria-hidden="true"
      />
      <p className="text-gray-500 text-base font-normal">로딩 중...</p>
    </div>
  )
}
