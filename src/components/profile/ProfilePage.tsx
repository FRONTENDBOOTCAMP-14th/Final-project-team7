'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import EmailCardClient from '@/components/profile/email-card'
import ProfileCardClient from '@/components/profile/profile-card/profile-card'
import SignoutButton from '@/components/profile/signout-button'
import { supabase } from '@/lib/supabase/supabase-client'
import '@/styles/main.css'

interface ProfileData {
  user_name: string | null
  bio: string | null
  signup_date: string | null
  profile_image_url: string | null
}

// 🔥 테스트용 설정
const USE_TEST_MODE = true
const TEST_EMAIL = 'dltjddms072@gmail.com'
const TEST_PASSWORD = 'tjddms!#579'

export default function ProfilePageClient() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        let user = null

        if (USE_TEST_MODE) {
          // 테스트 모드: 자동 로그인
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: TEST_EMAIL,
              password: TEST_PASSWORD,
            })

          if (authError) {
            toast.error('로그인에 실패했습니다.')
            return
          }

          user = authData.user
        } else {
          // 실제 모드: 현재 로그인된 사용자 확인
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser()

          if (!currentUser) {
            toast.error('로그인이 필요합니다.')
            router.push('/sign-in')
            return
          }

          user = currentUser
        }

        if (!user) return

        setEmail(user.email ?? null)

        // Supabase에서 프로필 조회
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
      } catch (_err) {
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

      // 테스트 모드에서는 페이지만 새로고침
      if (USE_TEST_MODE) {
        window.location.reload()
      } else {
        router.push('/sign-in')
      }
    } catch (_err) {
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <section className="flex flex-col w-full p-5 gap-5 items-center">
        <div className="animate-pulse">로딩 중...</div>
      </section>
    )
  }

  return (
    <section className="flex flex-col w-full p-5 gap-5 items-center">
      <ProfileCardClient profileData={profileData} editable={true} />
      <EmailCardClient email={email} />
      <SignoutButton onClick={handleSignOut} />
    </section>
  )
}
