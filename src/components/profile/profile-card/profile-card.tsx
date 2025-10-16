'use client'

import Profile from '@/components/common/profile'
import EditButton from '@/components/profile/profile-card/edit-button'
import '@/styles/common/theme.css'

interface ProfileData {
  user_name: string | null
  bio: string | null
  signup_date: string | null
  profile_image_url: string | null
}

interface ProfileCardClientProps {
  profileData: ProfileData | null
  editable?: boolean
  onEdit?: () => void
}

export default function ProfileCardClient({
  profileData,
  editable = true,
  onEdit,
}: ProfileCardClientProps) {
  // 프로필 정보가 없는 경우
  if (!profileData) {
    return (
      <div
        className="
          flex 
          relative 
          items-center 
          w-full max-w-[393px]
          gap-4
          p-5
          bg-white 
          drop-shadow-[0_0_6px_rgba(0,0,0,0.25)]  
        "
      >
        <div className="flex-shrink-0">
          <Profile alt="게스트" size={60} />
        </div>

        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3
            className="
              text-base
              font-reguler 
              truncate 
              text-[var(--color-basic-400)]
            "
          >
            게스트
          </h3>
          <p
            className="
              line-clamp-2 
              mt-1 
              text-sm 
              text-[var(--color-basic-300)]
            "
          >
            로그인 후 이용해주세요.
          </p>
        </div>
      </div>
    )
  }

  const profileImageUrl =
    profileData.profile_image_url ?? '/dev_profiles/default_user.png'
  const userName = profileData.user_name ?? '사용자'

  // 가입날짜 포맷 수정 (마지막 점 제거)
  const formattedDate = profileData.signup_date
    ? `가입날짜: ${new Date(profileData.signup_date)
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\.$/, '')}` // 마지막 점 제거
    : null

  return (
    <div
      className="
        flex 
        relative
        items-center
        w-full max-w-[393px]
        gap-4
        p-5  
        bg-white 
        drop-shadow-[0_0_6px_rgba(0,0,0,0.25)] 
      "
    >
      <div className="flex-shrink-0">
        <Profile src={profileImageUrl} alt={userName} size={60} />
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h3
          className="
            text-base
            truncate 
            font-reguler 
            text-[var(--color-basic-400)]
          "
        >
          {userName}
        </h3>
        {profileData.bio && (
          <p
            className="
              line-clamp-2 
              mt-1 
              text-sm 
              text-[var(--color-basic-300)]
            "
          >
            {profileData.bio}
          </p>
        )}
        {formattedDate && (
          <p
            className="
              line-clamp-2 
              mt-1 
              text-xs 
              text-[var(--color-basic-200)]
            "
          >
            {formattedDate}
          </p>
        )}
      </div>

      {editable && (
        <div className="absolute top-5 right-7">
          <EditButton onClick={onEdit} />
        </div>
      )}
    </div>
  )
}
