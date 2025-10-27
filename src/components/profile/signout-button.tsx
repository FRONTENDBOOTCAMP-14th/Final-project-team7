'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export default function SignoutButton() {
  const router = useRouter()

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

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full max-w-[363px] p-4 border-2 border-[var(--color-basic-100)]"
      aria-label="로그아웃"
    >
      <p className="text-center">로그아웃</p>
    </button>
  )
}
