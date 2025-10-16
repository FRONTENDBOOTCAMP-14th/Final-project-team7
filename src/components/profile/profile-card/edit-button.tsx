'use client'

import { MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditButtonProps {
  onClick?: () => void
  ariaLabel?: string
}

export default function EditButton({
  onClick,
  ariaLabel = '프로필 편집',
}: EditButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    router.push('/profile/profile-edit')
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={ariaLabel}
      type="button"
    >
      <MoreVertical size={16} strokeWidth={2} />
    </button>
  )
}
