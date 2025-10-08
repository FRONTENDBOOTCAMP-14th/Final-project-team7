'use client'

interface EditButtonProps {
  onClick: () => void
}

export default function EditButton({ onClick }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm transition cursor-pointer"
    >
      {/* (svg 넣어야 할 자리) */}
      <span>코스 수정</span>
    </button>
  )
}
