import type { PropsWithChildren } from 'react'

import FeatHeader from '@/components/common/feat-header'

import '@/styles/main.css'

export default function ProfileEditLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <FeatHeader title="회원가입" />
      {children}
    </div>
  )
}
