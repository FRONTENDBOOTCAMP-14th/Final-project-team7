'use client'

import '@/styles/main.css'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export default function SignUpClient() {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

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
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('회원가입 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <form
      onSubmit={handleSignUp}
      className="flex flex-col w-full max-w-[313px] gap-10"
    >
      <div className="flex flex-col gap-4">
        {/* 이름 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="name"
            className="mb-1 font-medium text-sm text-[var(--color-basic-300)]"
          >
            이름*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="이름을 입력해주세요"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            className="p-3 border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)] rounded-sm"
            required
            disabled={loading}
          />
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="mb-1 font-medium text-sm text-[var(--color-basic-300)]"
          >
            이메일*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-3 border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)] rounded-sm"
            required
            disabled={loading}
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="mb-1 font-medium text-sm text-[var(--color-basic-300)]"
          >
            비밀번호*
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded-sm border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)]"
            minLength={6}
            required
            disabled={loading}
          />
        </div>

        {/* 소개글 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="bio"
            className="mb-1 font-medium text-sm text-[var(--color-basic-300)]"
          >
            소개글
          </label>
          <textarea
            id="bio"
            name="bio"
            placeholder="소개글을 입력해주세요"
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="p-3 h-20 rounded-sm border border-[var(--color-basic-100)] text-xs placeholder-[var(--color-basic-200)] resize-none"
            disabled={loading}
          />
        </div>

        {/* 버튼 */}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-disabled={loading}
          className="p-3 w-full max-w-[313px] rounded-lg bg-[var(--color-point-100)] text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </div>
    </form>
  )
}
