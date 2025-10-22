import Link from 'next/link'

import Profile from './profile'

export default function Header() {
  return (
    <div className="w-full">
      <header className="relative w-full h-20 flex items-center justify-center px-4 shadow-lg">
        <Link
          href="/main"
          aria-label="홈으로 이동"
          className="flex items-center"
        >
          <img
            src="/logo.png"
            alt="러닝일레븐 로고"
            className="w-32 h-8 object-contain cursor-pointer"
          />
        </Link>

        <Link
          href="/profile"
          aria-label="프로필 설정으로 이동"
          className="absolute right-4"
        >
          <Profile size={42} />
        </Link>
      </header>
    </div>
  )
}
