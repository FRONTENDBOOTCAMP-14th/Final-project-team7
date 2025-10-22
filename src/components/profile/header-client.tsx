'use client'

import { usePathname } from 'next/navigation'

import FeatHeader from '@/components/common/feat-header'

const PAGE_TITLES: Record<string, string> = {
  '/profile/profile-edit': '프로필 편집',
  '/profile/calendar': '러닝 캘린더',
  '/profile/friends': '친구 관리',
  '/profile/music': '러닝곡 관리',
}

export default function HeaderClient() {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname]

  if (!pageTitle) return null
  return <FeatHeader title={pageTitle} />
}
