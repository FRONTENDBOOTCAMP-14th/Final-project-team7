import type { PropsWithChildren } from 'react'

import '@/styles/main.css'

export default function ProfileEditLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex justify-center items-start w-full min-h-screen py-10">
      {children}
    </div>
  )
}
