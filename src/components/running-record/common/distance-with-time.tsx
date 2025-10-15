'use client'

interface InputWithLabelProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
}

export default function DistanceWithTime({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
}: InputWithLabelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (label === '분' || label === '초') {
      const num = Number(newValue)

      if (isNaN(num)) {
        onChange('')
        return
      }

      if (num < 0) newValue = '0'
      else if (num > 59) newValue = '59'
    }

    onChange(newValue)
  }

  return (
    <label
      htmlFor={id}
      className="flex flex-col w-full text-sm text-right text-gray-700"
    >
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-md p-2 text-gray-700
          ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white'
          }`}
      />
    </label>
  )
}
