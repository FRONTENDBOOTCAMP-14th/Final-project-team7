'use client'

import Profile from '@/components/common/profile'
import '@/styles/common/theme.css'

interface ProfileEditProps {
  imageUrl: string | null
  onChangeImage: (file: File) => void
}

export default function ProfileEdit({
  imageUrl,
  onChangeImage,
}: ProfileEditProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      // 이미지 파일인지 확인
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

      <div className="flex items-center justify-center w-4 h-4 absolute bottom-0 right-0 rounded-full bg-white drop-shadow-[0_0_6px_rgba(0,0,0,0.25)]">
        <label className="cursor-pointer">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEgklEQVR4nO2cy29VRRjAf21pCyYa8YooujJxgbJQw04gsMQHIBA2usZosETDa1WeRQT03xC3xqVIELDySK2EnY8EBdISNgSS3rpgzCTfSSo5M+c+5rzmfL/kS5p7b7+Z+eXceZ25BxRFURRFURRFURQvLwDHgRvAHGD6jDnJNQE87y+6OWwA7gWQ6wqbez0N52XgQY6Sk3gIvEKNGQG+BO481rDbwAl538fZAiQn8QM15kRG4+z7LtYXKDmJ2nYhtzMaZt9PYwA4X4Lo81J2Y/i4BMlJfERD+DDQFK7XsGV/QKSsAN4Bvi9R8MJ4BHwHbJS6VY7FwG7gskyZTMPiIfALMAaM5iX5JeC3CjTWVCSmxUnwK1klkyo76JW9uwKNMhWNT0OKvlyBBpmKxmRI0UXsR5iahnUTjDIa0AbOAePAFmAlsBQYlj0U+/er8t64fLYdqOx5YJ9M/Wzsl9dcn6+l6ClgJ/B0D/VcKiu/qT7rYMU+zv5YRE/LAiLEXsSALJCu91iXtEXMirqLngM+AxYRHptzTw9dSnSifwdeJ3/eAP7os+s4UFfRV4BlFMdzwNUO6zYvsms/GF4Bnuyg3CFgHfCVzFdngX8lZuW108Ba+WwWtsxrObQnGKG7i2UZ5S2Rr+rdLvLOypTM/m/Wlf1n7KLnOuiTdwC3+ijjb2B7RhlvBpxzV1L0554yBoEvAu43T0hOF3tjFT3tmcJZId8GbHgSZzyyh/uYZ1da9EZP/lBXcloc85T7Xmyipzwrvh05Sk66kW2OsgfkmxaN6J2OvEtk8DI5hx1cn3DU4ZNYRLc9G0S+1VbosINfGs9kLEZqI/pHR86hLufJ/caMZ1HzUwyixx051xUoOYk1jrocikH0ZkfOr0sQfcpRl60xiF7pyDlZguhLjrq8FoPoliNnkf3zwn46jWdjED3iyNnvSN/rDCgNezZDRaOiO4qWI6d2HQUNhj+XIPpizIPhZkfO0yWItr+3iXZ6N+7IubYE0W876nI4BtHnHDmH5PZTkf3zYMxL8LacIEpjX4Gi7fmONFpys7f2oo3nBzr23PXNAiT/47lpG802qcnY+N8um/N5Sba532/Kxr8B3vbkn8hR9BFPuZsClVEp0dczbs6eyUHyNxk3Z2/EKNp4BqRE9kSgbsTmOJpx3MB3DLf2ottyeMXHtj7vI9709MkJq2M/QGPkVKc9luVjsdzjm+ki74x8Y+z/+lgO/BW4TcEwgeNqh4ccB+X20ynZtJ+RXb95+du+dlJWfL5uIuGpJh1yNBLXOriyQ7I8J8mVF22kG8nqs0OwOofuolaijQxKe2W6FZphmV2EHPhqK9osmGe/G/DHQpsCzpOjEm0kpuXBKfYEUbe0ZO8ixLI6etFGYl62Lw/KxvwqETki0ZLXtsoBmAsBduEaKdrUKFQ0KpqYIhj6dAOccT+kaH1eB8U8r2OsAg0yFY1dIUWPljA3NTWIXzt4/mrX2CdiqWz+J/lFcmJUHtY02dAB8oEcZduVx5WsKIqiKIqiKIqiKIqiKIpCvPwHtSMvdtx09nMAAAAASUVORK5CYII="
            alt="camera"
            className="w-3 h-3"
          />
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
