'use client'

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export function useSignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      toast.success('로그인에 성공했습니다!')
      router.push('/main')
    } catch {
      toast.error('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const goToSignUp = () => {
    router.push('/sign-in/sign-up')
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
    goToSignUp,
  }
}
