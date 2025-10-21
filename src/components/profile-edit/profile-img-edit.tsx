'use client'

import { Camera } from 'lucide-react'

import Profile from '@/components/common/profile'
import '@/styles/common/theme.css'

interface ProfileEditProps {
  imageUrl: string | null
  onChangeImage: (file: File) => void
}

export default function ProfileImgEdit({
  imageUrl,
  onChangeImage,
}: ProfileEditProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }

      onChangeImage(file)
    }
  }

  return (
    <div className="relative w-fit">
      <Profile src={imageUrl ?? undefined} alt="Profile" size={60} />

      <div className="flex items-center justify-center absolute w-4 h-4 bottom-0 right-0 rounded-full bg-white drop-shadow-[0_0_6px_rgba(0,0,0,0.25)]">
        <label className="cursor-pointer">
          <Camera className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  )
}
