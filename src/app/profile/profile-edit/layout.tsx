import type { PropsWithChildren } from 'react'

import '@/styles/main.css'

export default function ProfileEditLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex justify-center items-start w-full min-h-screen py-10">
      {/* 공용 상세페이지 네비바 */}
      {children}
    </main>
  )
}
