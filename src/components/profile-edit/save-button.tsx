'use client'
import '@/styles/common/theme.css'

interface SaveButtonProps {
  label?: string
  type?: 'button' | 'submit'
  loading?: boolean
}

export default function SaveButton({
  label = '저장하기',
  type = 'button',
  loading = false,
}: SaveButtonProps) {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full max-w-[313px] p-3 text-white font-medium rounded-lg 
        ${loading ? 'bg-gray-400' : 'bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)]'}`}
    >
      {loading ? '저장 중...' : label}
    </button>
  )
}
