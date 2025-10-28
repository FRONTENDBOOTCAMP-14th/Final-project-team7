import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureButtonProps {
  label: string
  href: string
  onClick?: () => void
}

export default function FeatureButton({
  label,
  href,
  onClick,
}: FeatureButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between w-full max-w-[363px] px-5 py-4 bg-white border-b border-[var(--color-basic-100)] hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <span className="text-base font-normal text-[var(--color-basic-400)]">
        {label}
      </span>
      <ChevronRight size={20} className="text-[var(--color-basic-200)]" />
    </Link>
  )
}
