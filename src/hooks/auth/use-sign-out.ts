'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export function useSignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const user = data.user
      if (!user) throw new Error('회원가입 중 문제가 발생했습니다.')

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          user_name: userName,
          bio,
          signup_date: new Date(),
          profile_image_url: null,
        },
      ])
      if (profileError) throw profileError

      toast.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
      router.push('/sign-in')
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message)
      else toast.error('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    userName,
    setUserName,
    bio,
    setBio,
    loading,
    handleSignUp,
  }
}
