'use client'

import '@/styles/main.css'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export default function SignInClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<boolean>(false)

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

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="로그인 폼"
      className="flex flex-col w-full max-w-[313px] gap-2"
    >
      <img src="/logo.png" alt="로고" className="w-50 h-auto mx-auto mb-4" />

      <label htmlFor="email" className="sr-only">
        이메일
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="이메일을 입력해주세요."
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-3 rounded-sm border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)]"
        required
        disabled={loading}
      />

      <label htmlFor="password" className="sr-only">
        비밀번호
      </label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="비밀번호를 입력해주세요."
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-3 rounded-sm border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)]"
        required
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading}
        className="p-3 w-full max-w-[313px] rounded-lg bg-[var(--color-point-200)] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <button
        type="button"
        onClick={goToSignUp}
        disabled={loading}
        className="p-3 w-full max-w-[313px] rounded-lg bg-[var(--color-point-100)] text-white text-sm disabled:opacity-50"
      >
        회원가입
      </button>
    </form>
  )
}
