'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import EmailCardClient from '@/components/profile/email-card'
import FeatureButton from '@/components/profile/feature-button'
import ProfileCard from '@/components/profile/profile-card/profile-card'
import RunningMusicCard from '@/components/profile/running-music-card'
import SignoutButton from '@/components/profile/signout-button'
import useProfileData from '@/hooks/profile/use-profile'
import { tw } from '@/utils/tw'

export default function ProfilePageClient() {
  const router = useRouter()
  const { profileData, email, loading } = useProfileData()

  useEffect(() => {
    if (!loading && !profileData) {
      router.replace('/sign-in')
    }
  }, [loading, profileData, router])

  if (loading || !profileData) {
    return (
      <section className="flex flex-col items-center w-full p-5 gap-5">
        <h2 className="sr-only">프로필 관리 페이지</h2>
        <div
          role="status"
          aria-live="polite"
          className={tw(`
        flex flex-col items-center justify-center
        w-full max-w-[768px] mx-auto px-4
        min-h-[50vh] gap-4
        bg-white text-gray-800
      `)}
        >
          <Loader2
            className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
            aria-hidden="true"
          />
          <p className="text-gray-500 text-base font-normal">불러오는 중...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center w-full p-5 gap-5">
      <h2 className="sr-only">프로필 관리 페이지</h2>
      <ProfileCard profileData={profileData} editable={true} />
      <EmailCardClient email={email} />
      <FeatureButton label="친구" href="/profile/friends" />
      <FeatureButton label="러닝캘린더" href="/profile/calendar" />
      <RunningMusicCard />
      <SignoutButton />
    </section>
  )
}
