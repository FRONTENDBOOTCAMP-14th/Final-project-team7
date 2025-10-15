'use client'

import '@/styles/common/theme.css'

interface EmailCardClientProps {
  email: string | null
}

export default function EmailCardClient({ email }: EmailCardClientProps) {
  return (
    <div className="w-full max-w-[363px] p-5 rounded-md border-2 border-[var(--color-basic-100)]">
      <h3 className="mb-3 text-base font-medium text-[var(--color-basic-300)]">
        이메일 정보
      </h3>
      <p className="text-sm text-[var(--color-basic-200)]">
        {email ?? '로그인 후 이메일을 확인하세요.'}
      </p>
    </div>
  )
}
