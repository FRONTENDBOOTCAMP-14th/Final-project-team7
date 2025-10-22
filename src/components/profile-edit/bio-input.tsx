'use client'

import '@/styles/common/theme.css'

interface BioInputProps {
  value: string
  onChange: (value: string) => void
}

export default function BioInput({ value, onChange }: BioInputProps) {
  return (
    <div className="flex flex-col w-full max-w-[313px]">
      <label
        className="mb-1 font-medium text-[var(--color-basic-300)]"
        htmlFor="bio"
      >
        소개글
      </label>
      <textarea
        id="bio"
        placeholder="소개글을 입력해주세요."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="p-3 h-20 rounded-sm border border-[var(--color-basic-100)] placeholder-[var(--color-basic-200)] resize-none"
      />
    </div>
  )
}
