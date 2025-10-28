'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

interface AddFriendModalProps {
  currentUserId: string
  onClose: () => void
  onAddSuccess: () => void
  anchorRef?: React.RefObject<HTMLButtonElement | null>
}

type FriendStatus = 'pending' | 'accepted' | 'rejected'

export default function AddFriendsModal({
  currentUserId,
  onClose,
  onAddSuccess,
  anchorRef,
}: AddFriendModalProps) {
  const [emailInput, setEmailInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const emailFieldRef = useRef<HTMLInputElement | null>(null)

  const handleClose = useCallback(() => {
    onClose()
    if (anchorRef?.current) {
      anchorRef.current.focus()
    }
  }, [onClose, anchorRef])

  function handleOverlayClick() {
    handleClose()
  }

  useEffect(() => {
    emailFieldRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }

      if (e.key === 'Tab') {
        const root = dialogRef.current
        if (!root) return

        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )

        if (focusables.length === 0) return

        const active = document.activeElement as HTMLElement | null
        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
          return
        }

        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const email = emailInput.trim()

      if (!email) {
        setErrorMessage('이메일을 입력해주세요.')
        setIsSubmitting(false)
        return
      }

      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()

      if (profileError || !targetProfile) {
        setErrorMessage('해당 이메일의 사용자를 찾을 수 없습니다')
        setIsSubmitting(false)
        return
      }

      const targetUserId = targetProfile.id

      if (targetUserId === currentUserId) {
        setErrorMessage('본인에게 친구 요청을 보낼 수 없습니다')
        setIsSubmitting(false)
        return
      }

      const { data: existingRows } = await supabase
        .from('friends')
        .select('id, status, user_id, friend_id')
        .or(
          `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
        )

      const alreadyAccepted = existingRows?.some(
        row => row.status === 'accepted'
      )
      const alreadyPending = existingRows?.some(row => row.status === 'pending')

      if (alreadyAccepted) {
        setErrorMessage('이미 친구 상태입니다')
        setIsSubmitting(false)
        return
      }

      if (alreadyPending) {
        setErrorMessage('이미 친구 요청이 진행 중 입니다')
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from('friends').insert({
        user_id: currentUserId,
        friend_id: targetUserId,
        status: 'pending' as FriendStatus,
      })

      if (insertError) {
        setErrorMessage('친구 요청을 보내지 못했습니다')
        setIsSubmitting(false)
        return
      }

      toast.success('친구 요청을 보냈습니다')
      onAddSuccess()
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div
        role="presentation"
        aria-hidden="true"
        onClick={handleOverlayClick}
        className={tw(`
          fixed inset-0 z-[9998]
          bg-black/40 backdrop-blur-sm
        `)}
      />

      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="add-friend-modal-title"
        aria-describedby="add-friend-modal-desc"
        className={tw(`
          fixed z-[9999]
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-[360px]
          bg-white border border-gray-200 rounded-lg
          shadow-[0_8px_24px_rgba(0,0,0,0.12)]
          p-4
          text-gray-800 text-base font-normal
        `)}
      >
        <header
          className={tw(`
            flex flex-col items-start gap-2
            w-full
            text-gray-800
          `)}
        >
          <button
            type="button"
            onClick={handleClose}
            className={tw(`
              flex items-center justify-center
              w-[32px] h-[32px]
              bg-gray-800 border border-transparent rounded-full
              text-white text-base font-normal
              hover:bg-gray-700 focus:ring-2
              cursor-pointer
            `)}
            aria-label="모달 닫기"
          >
            <ArrowLeft className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className={tw(`
            mt-4
            flex flex-col
            w-full gap-4
            text-gray-800 text-base font-normal
          `)}
        >
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="friend-email"
              className="text-gray-700 text-lg font-normal"
            >
              이메일로 친구 추가
            </label>

            <input
              ref={emailFieldRef}
              id="friend-email"
              type="email"
              required
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className={tw(`
                w-full px-3 py-2
                bg-white border border-gray-300 rounded-md shadow-inner
                text-gray-800 text-sm font-normal
                outline-none
              `)}
              placeholder="example@email.com"
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? 'friend-email-error' : undefined}
            />

            {errorMessage && (
              <p
                id="friend-email-error"
                className="text-red-600 text-[16px] font-normal"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={tw(
              `
              flex items-center justify-center
              w-full h-[44px]
              border border-transparent rounded-md
              text-white text-sm font-normal
              shadow-[0_0_6px_0_rgba(0,0,0,0.15)]
              cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed
            `,
              isSubmitting
                ? 'bg-gray-400 hover:bg-gray-400 cursor-wait'
                : 'bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] cursor-pointer'
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              '추가하기'
            )}
          </button>
        </form>
      </dialog>
    </>
  )
}
