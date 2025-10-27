'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

interface ProfileProps {
  src?: string | null
  alt?: string
  size?: number
}

export default function Profile({
  src: externalSrc,
  size = 60,
  alt = 'Profile',
}: ProfileProps) {
  const [src, setSrc] = useState(
    externalSrc ?? '/dev_profiles/default_user.png'
  )

  useEffect(() => {
    if (externalSrc) {
      setSrc(externalSrc)
      return
    }

    const fetchProfileImage = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setSrc('/dev_profiles/default_user.png')
          return
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .eq('id', user.id)
          .single()

        if (error ?? !profileData?.profile_image_url) {
          setSrc('/dev_profiles/default_user.png')
          if (error) toast.error(`프로필 조회 실패: ${error.message}`)
          return
        }

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('profile_image')
            .createSignedUrl(profileData.profile_image_url, 60)

        if (signedUrlError ?? !signedUrlData?.signedUrl) {
          setSrc('/dev_profiles/default_user.png')
          if (signedUrlError)
            toast.error(`Signed URL 생성 실패: ${signedUrlError.message}`)
          return
        }

        setSrc(signedUrlData.signedUrl)
      } catch {
        setSrc('/dev_profiles/default_user.png')
        toast.error('프로필 이미지 로드 중 오류가 발생했습니다.')
      }
    }

    fetchProfileImage()
  }, [externalSrc])

  return (
    <div
      className="overflow-hidden rounded-full bg-white drop-shadow-[0_0_6px_rgba(0,0,0,0.25)]"
      style={{ width: size, height: size }}
      aria-label="프로필 아이콘"
      role="img"
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  )
}
