'use client'

interface InputWithLabelProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
}

export default function InputTimeWithLabel({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: InputWithLabelProps) {
  return (
    <div className="relative w-full">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-md p-2 pr-12 text-gray-700 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
      />
      <span
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none ${
          disabled ? 'text-gray-400' : ''
        }`}
      >
        {label}
      </span>
    </div>
  )
}
