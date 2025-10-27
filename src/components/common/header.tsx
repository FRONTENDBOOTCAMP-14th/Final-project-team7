'use client'

import type { Session } from '@supabase/supabase-js'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import NavigationMenu from '@/components/common/navigation-menu'
import { supabase } from '@/lib/supabase/supabase-client'
import type { ProfileData } from '@/types/profile/profile'
import { tw } from '@/utils/tw'

export default function Header() {
  const pathname = usePathname()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('러너')

  function handleToggleMenu() {
    setIsMenuOpen(prev => !prev)
  }

  function handleCloseMenu() {
    setIsMenuOpen(false)
  }

  async function resolveUsernameFromSession(session: Session | null) {
    if (!session) {
      setIsAuthenticated(false)
      setUsername('러너')
      return
    }

    setIsAuthenticated(true)

    const userId = session.user.id

    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_name, bio, signup_date, profile_image_url')
      .eq('id', userId)
      .single<ProfileData>()

    let resolvedName = ''

    if (profileData?.user_name) {
      resolvedName = profileData.user_name
    }

    if (!resolvedName) {
      const meta = session.user.user_metadata
      resolvedName =
        meta?.username ??
        meta?.name ??
        meta?.full_name ??
        session.user.email ??
        ''
    }

    if (!resolvedName) {
      resolvedName = '러너'
    }

    setUsername(resolvedName)
  }

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      await resolveUsernameFromSession(data.session)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await resolveUsernameFromSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const shouldHideHeader =
    pathname.startsWith('/profile/') ||
    pathname === '/sign-in' ||
    pathname === '/sign-in/sign-up'

  if (shouldHideHeader) {
    return null
  }

  return (
    <header
      className="
        flex items-center justify-between
        w-full h-20 px-4
        bg-white shadow-lg
        text-gray-800 text-base font-normal
      "
    >
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-controls="site-navigation-menu"
        aria-expanded={isMenuOpen}
        onClick={handleToggleMenu}
        className={tw(`
          flex items-center justify-center
          w-[40px] h-[40px]
          bg-transparent hover:bg-gray-100 border border-transparent rounded-lg
          text-gray-800 text-base font-normal
          cursor-pointer transition
        `)}
      >
        <Menu className="w-[35px] h-[35px]" aria-hidden="true" />
      </button>

      <Link
        href="/main"
        aria-label="홈으로 이동"
        className={tw(`
          flex items-center justify-center flex-1
          h-full
          bg-transparent border border-transparent
          text-gray-800 text-base font-semibold
          cursor-pointer
        `)}
      >
        <Image
          src="/logo.png"
          alt="러닝일레븐 로고"
          width={250}
          height={50}
          priority
          fetchPriority="high"
          className={tw(`
            flex object-contain
            bg-transparent border border-transparent
            text-gray-800 text-base font-normal
          `)}
        />
      </Link>

      <div
        className={tw(`
          flex items-center justify-center
          w-[40px] h-[40px]
          bg-transparent border border-transparent rounded-lg
          text-gray-800 text-base font-normal
        `)}
        aria-hidden="true"
      />

      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        isAuthenticated={isAuthenticated}
        username={username}
      />
    </header>
  )
}
