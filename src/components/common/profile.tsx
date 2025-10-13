'use client'

import '@/styles/common/theme.css'

interface ProfileProps {
  src?: string
  alt?: string
  size?: number
  onClick?: () => void
}

export default function Profile({
  src,
  alt = 'Profile',
  size = 60,
  onClick,
}: ProfileProps) {
  const displaySrc = src ?? '/dev_profiles/default_user.png'

  return (
    <button
      onClick={onClick}
      className="overflow-hidden bg-white drop-shadow-[0_0_6px_rgba(0,0,0,0.25)] rounded-full"
      style={{ width: size, height: size }}
      aria-label="프로필 아이콘"
    >
      <img src={displaySrc} alt={alt} className="w-full h-full object-cover" />
    </button>
  )
}
