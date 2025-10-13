import '@/styles/common/theme.css'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
}

export default function UsernameInput({
  value,
  onChange,
  id = 'username',
  className = '',
}: UsernameInputProps) {
  return (
    <div className={`flex flex-col w-full max-w-[313px] ${className}`}>
      <label
        className="mb-1 font-medium text-[var(--color-basic-300)]"
        htmlFor={id}
      >
        이름
      </label>
      <input
        id={id}
        type="text"
        placeholder="이름을 입력해주세요."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="p-3 border border-[var(--color-basic-100)] placeholder-[var(--color-basic-200)] rounded-sm"
      />
    </div>
  )
}
