'use client'

import { usePathname } from 'next/navigation'

import PageHeader from '@/components/common/feat-header'

const PAGE_TITLES: Record<string, string> = {
  '/profile/profile-edit': '프로필 편집',
  '/profile/calendar': '러닝 캘린더',
  '/profile/friends': '친구 관리',
  '/profile/music': '러닝곡 관리',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const pageTitle = PAGE_TITLES[pathname]

  return (
    <>
      {pageTitle && <PageHeader title={pageTitle} />}
      {children}
    </>
  )
}
