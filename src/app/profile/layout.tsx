import '@/styles/main.css'
import type { PropsWithChildren } from 'react'

export default function ProfileLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko-KR">
      <body>
        <main className="flex justify-center items-start min-h-screen py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
