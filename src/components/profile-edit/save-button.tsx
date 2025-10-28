interface SaveButtonProps {
  label?: string
  type?: 'button' | 'submit'
  loading?: boolean
  onClick?: () => void
}

export default function SaveButton({
  label = '저장하기',
  type = 'button',
  loading = false,
  onClick,
}: SaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full max-w-[313px] p-3 rounded-lg text-white font-medium cursor-pointer
        ${loading ? 'bg-gray-400' : 'bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)]'}`}
    >
      {loading ? '저장 중...' : label}
    </button>
  )
}
