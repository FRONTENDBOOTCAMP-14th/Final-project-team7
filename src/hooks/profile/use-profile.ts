import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'
import type { ProfileData } from '@/types/profile/profile'

export default function useProfileData() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          toast.error('로그인이 필요합니다.')
          return
        }

        setEmail(user.email ?? null)

        const { data: profileById, error } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()) as { data: ProfileData | null; error: unknown }

        if (error) {
          toast.error('프로필 정보를 불러오는데 실패했습니다.')
          return
        }

        if (profileById) {
          let profileImageUrl: string | null = null
          if (profileById.profile_image_url) {
            const { data: publicUrlData } = supabase.storage
              .from('profile_image')
              .getPublicUrl(profileById.profile_image_url)
            profileImageUrl = publicUrlData.publicUrl
          }

          setProfileData({
            user_name: profileById.user_name ?? null,
            bio: profileById.bio ?? null,
            signup_date: profileById.signup_date ?? null,
            profile_image_url: profileImageUrl,
          })
        }
      } catch {
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profileData, email, loading }
}
