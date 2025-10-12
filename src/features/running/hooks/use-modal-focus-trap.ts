'use client'

import { useEffect } from 'react'

/**
 * 모달 열릴 때:
 * - body 스크롤 잠금
 * - Tab 포커스를 모달 내부로만 순환
 * - ESC 키로 닫기
 */
export function useModalFocusTrap(
  modalRef: React.RefObject<HTMLDivElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const elements = getFocusableElements()
        const first = elements[0]
        const last = elements[elements.length - 1]

        const isInModal = modal.contains(document.activeElement)

        if (!isInModal) {
          e.preventDefault()
          first?.focus()
          return
        }

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // 🔹 cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [modalRef, onClose])
}
