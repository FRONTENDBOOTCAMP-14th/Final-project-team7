import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: '러닝 기록 관리 | 러닝 일레븐',
  description: '러닝 기록을 추가하고 관리할 수 있는 러닝 전용 페이지입니다.',
  keywords: ['러닝', '기록', '러닝 코스', '운동', 'Running Record'],
  openGraph: {
    title: '러닝 기록',
    description: '러닝 기록을 추가하고 코스를 관리하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RunningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'rounded-lg shadow-md text-sm font-medium',
            success: 'bg-blue-100 text-blue-800 border border-blue-300',
            error: 'bg-red-100 text-red-800 border border-red-300',
          },
        }}
      />
    </>
  )
}
