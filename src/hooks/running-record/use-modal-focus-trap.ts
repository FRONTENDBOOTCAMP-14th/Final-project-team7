import { useEffect } from 'react'

export function useModalFocusTrap(
  modalRef: React.RefObject<HTMLDivElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusableElements = () =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )

    const focusableEls = getFocusableElements()

    const dropDownButton = modal.querySelector(
      '[aria-haspopup="listbox"], [role="button"]'
    )

    if (dropDownButton instanceof HTMLElement) {
      dropDownButton.focus()
    } else {
      focusableEls[0]?.focus()
    }

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
        const openDropdown =
          modal.querySelector('[role="listbox"]') ??
          modal.querySelector('[aria-expanded="true"]')
        if (openDropdown) {
          e.stopPropagation()
          const button = modal.querySelector('[aria-haspopup="listbox"]')
          if (button instanceof HTMLElement) button.focus()
          return
        }

        e.preventDefault()
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modal && e.target instanceof Node && !modal.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = originalOverflow
      previousActiveElement?.focus()
    }
  }, [modalRef, onClose])
}
