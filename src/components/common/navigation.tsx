'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import '@/styles/main.css'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="w-full flex items-center justify-center mt-2">
      <ul className="flex items-center justify-center gap-6">
        {[
          { name: '메인', href: '/main' },
          { name: '러닝', href: '/running-record' },
          { name: '프로필', href: '/profile' },
        ].map(item => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`w-[130px] h-[50px] flex items-center justify-center rounded-lg text-base font-sm text-white
                ${
                  isActive(item.href)
                    ? 'bg-[var(--color-point-200)]'
                    : 'bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)]'
                }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
