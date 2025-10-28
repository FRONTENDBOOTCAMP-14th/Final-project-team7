'use client'

import useSignIn from '@/hooks/auth/use-sign-in'

export default function SignInClient() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
    goToSignUp,
  } = useSignIn()

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
        className="p-3 w-full max-w-[313px] rounded-lg bg-[var(--color-point-200)] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <button
        type="button"
        onClick={goToSignUp}
        disabled={loading}
        className="p-3 w-full max-w-[313px] rounded-lg bg-[var(--color-point-100)] text-white text-sm disabled:opacity-50 cursor-pointer"
      >
        회원가입
      </button>
    </form>
  )
}
