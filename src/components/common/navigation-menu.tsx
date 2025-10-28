'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import Profile from '@/components/common/profile'
import { NAVIGATION_ITEMS } from '@/constants/main/common/navigation-items'
import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  username: string
}

export default function NavigationMenu({
  isOpen,
  onClose,
  isAuthenticated,
  username,
}: NavigationMenuProps) {
  const pathname = usePathname()
  const router = useRouter()

  const menuRef = useRef<HTMLElement | null>(null)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const getNavItemClass = (active: boolean) => {
    return `
      flex items-center
      w-full py-3 px-4
      ${
        active
          ? 'bg-[var(--color-point-100)] border border-transparent rounded-lg shadow-[0_0_6px_0_rgba(0,0,0,0.15)]'
          : 'bg-transparent border border-transparent rounded-lg'
      }
      ${active ? 'text-white text-base' : 'text-gray-800 text-base'}
      hover:bg-[var(--color-point-200)] hover:text-white cursor-pointer
    `
      .replace(/\s+/g, ' ')
      .trim()
  }

  useEffect(() => {
    if (!isOpen) return

    const root = menuRef.current
    if (!root) return

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('aria-hidden'))

    if (focusables.length === 0) return

    const firstEl = focusables[0]
    const lastEl = focusables[focusables.length - 1]

    firstEl.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  async function handleLogout() {
    await supabase.auth.signOut()
    onClose()
    router.replace('/sign-in')
  }

  const tabbableWhenOpen = isOpen ? 0 : -1

  return (
    <>
      <div
        role="presentation"
        aria-hidden={isOpen ? 'false' : 'true'}
        onClick={isOpen ? onClose : undefined}
        className={tw(`
          fixed inset-0 z-[9998]
          bg-black/40 backdrop-blur-sm
          transition-opacity
          ${
            isOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }
        `)}
      />
      <aside
        id="site-navigation-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={isOpen ? 'site-navigation-menu-label' : undefined}
        aria-hidden={isOpen ? 'false' : 'true'}
        className={tw(`
          fixed inset-y-0 left-0 z-[9999] flex flex-col
          w-[300px] max-w-[85%] h-full p-5 gap-6 overflow-y-auto
          bg-white border-r border-gray-200 rounded-none shadow-[0_4px_24px_rgba(0,0,0,0.12)]
          text-gray-800
          transition-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `)}
      >
        <div
          className={tw(`
            flex items-center justify-between
            w-full
            text-gray-800 text-base font-semibold
          `)}
        >
          <span
            id="site-navigation-menu-label"
            className="
              flex items-center
              text-gray-800 text-base font-semibold
            "
          >
            메뉴
          </span>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            tabIndex={tabbableWhenOpen}
            className={tw(`
              flex items-center justify-center
              w-[32px] h-[32px]
              bg-transparent hover:bg-gray-100 border border-transparent rounded-lg
              text-gray-800 text-base font-normal
              cursor-pointer transition
            `)}
          >
            <X className="w-[20px] h-[20px]" aria-hidden="true" />
          </button>
        </div>

        {isAuthenticated ? (
          <Link
            href="/profile"
            aria-label="프로필로 이동"
            onClick={onClose}
            tabIndex={tabbableWhenOpen}
            className={tw(`
              flex items-center
              w-full gap-3
              bg-transparent hover:bg-gray-100 border border-transparent rounded-lg
              text-gray-800 text-base font-normal
              cursor-pointer transition
            `)}
          >
            <div
              data-focus-skip="true"
              className="
                flex
                bg-transparent border border-transparent rounded-full
              "
            >
              <Profile size={48} />
            </div>

            <div
              className={tw(`
                flex flex-col
                bg-transparent border border-transparent
                text-gray-800 text-base font-normal
              `)}
            >
              <span className="text-gray-900 text-base font-semibold">
                {username}
              </span>
              <span className="text-gray-500 text-sm font-normal">
                프로필 보기
              </span>
            </div>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              router.push('/sign-in')
            }}
            tabIndex={tabbableWhenOpen}
            className={tw(`
              flex items-center justify-center
              w-full h-[48px]
              bg-[var(--color-point-200)] hover:bg-[var(--color-point-100)]
              border border-transparent rounded-lg shadow-[0_0_6px_0_rgba(0,0,0,0.25)]
              text-white text-base font-semibold
              cursor-pointer
            `)}
          >
            로그인
          </button>
        )}

        <nav
          aria-label="메뉴 내비게이션"
          className={tw(`
            flex flex-col flex-1
            w-full gap-2 
            bg-transparent border border-transparent rounded-lg
            text-gray-800 text-base font-normal
          `)}
        >
          <ul
            className={tw(`
              flex flex-col
              w-full gap-1
              text-gray-800 text-base font-normal
            `)}
          >
            {NAVIGATION_ITEMS.map(item => (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  tabIndex={tabbableWhenOpen}
                  className={getNavItemClass(isActive(item.href))}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={() => {
                    if (!item.href.startsWith('/profile')) {
                      onClose()
                    }
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {isAuthenticated && (
          <div
            className={tw(`
              mt-auto
              w-full pt-4
              border-t border-gray-200
            `)}
          >
            <button
              type="button"
              onClick={handleLogout}
              tabIndex={tabbableWhenOpen}
              className={tw(`
                flex items-center justify-center
                w-full h-[44px]
                bg-[var(--color-point-200)]
                hover:bg-[var(--color-point-100)]
                border border-gray-300 rounded-lg
                shadow-[0_0_6px_0_rgba(0,0,0,0.15)]
                text-white text-base font-normal
                cursor-pointer
              `)}
            >
              로그아웃
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
