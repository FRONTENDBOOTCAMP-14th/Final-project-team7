'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import EmailCardClient from '@/components/profile/email-card'
import FeatureButton from '@/components/profile/feature-button'
import ProfileCard from '@/components/profile/profile-card/profile-card'
import RunningMusicCard from '@/components/profile/running-music-card'
import SignoutButton from '@/components/profile/signout-button'
import useProfileData from '@/hooks/profile/use-profile'

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
        <div className="animate-pulse">로딩 중...</div>
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
