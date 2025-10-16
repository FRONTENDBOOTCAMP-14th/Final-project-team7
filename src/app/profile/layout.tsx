import '@/styles/main.css'
import type { PropsWithChildren } from 'react'

export default function ProfileLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex justify-center items-start min-h-screen py-10">
      {children}
    </main>
  )
}
