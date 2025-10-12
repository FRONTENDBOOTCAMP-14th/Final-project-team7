import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '러닝 기록 관리 | 러닝 일레븐',
  description: '러닝 기록을 추가하고 관리할 수 있는 러닝 전용 페이지입니다.',
  keywords: ['러닝', '기록', '러닝 코스', '운동', 'Running Tracker'],
  openGraph: {
    title: '러닝 기록',
    description: '러닝 기록을 추가하고 코스를 손쉽게 관리하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RunningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <main className="min-h-[70vh]">{children}</main>
    </div>
  )
}
