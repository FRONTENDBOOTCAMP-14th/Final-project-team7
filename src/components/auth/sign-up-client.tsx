'use client'

import useSignUp from '@/hooks/auth/use-sign-out'
import '@/styles/main.css'

export default function SignUpClient() {
  const {
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
  } = useSignUp()

  return (
    <form
      onSubmit={handleSignUp}
      className="flex flex-col w-full max-w-[313px] gap-10"
    >
      <div className="flex flex-col gap-4">
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
