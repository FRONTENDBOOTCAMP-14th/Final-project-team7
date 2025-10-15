import '@/styles/common/theme.css'

interface SignoutButtonProps {
  onClick?: () => void
}

export default function SignoutButton({ onClick }: SignoutButtonProps) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="w-full max-w-[363px] p-4 border-2 border-[var(--color-basic-100)]"
      aria-label="로그아웃"
    >
      <p className="text-center">로그아웃</p>
    </button>
  )
}
