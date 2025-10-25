'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import EmailCardClient from '@/components/profile/email-card'
import ProfileCardClient from '@/components/profile/profile-card/profile-card'
import RunningMusicCard from '@/components/profile/running-music-card'
import SignoutButton from '@/components/profile/signout-button'
import { supabase } from '@/lib/supabase/supabase-client'

import '@/styles/main.css'

interface ProfileData {
  user_name: string | null
  bio: string | null
  signup_date: string | null
  profile_image_url: string | null
}

export default function ProfilePageClient() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error('로그인이 필요합니다.')
          router.push('/sign-in')
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
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('로그아웃되었습니다.')
      router.push('/sign-in')
    } catch {
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <section className="flex flex-col items-center w-full p-5 gap-5">
        <div className="animate-pulse">로딩 중...</div>
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center w-full p-5 gap-5">
      <ProfileCardClient profileData={profileData} editable={true} />
      <EmailCardClient email={email} />
      <RunningMusicCard />
      <SignoutButton onClick={handleSignOut} />
    </section>
  )
}
