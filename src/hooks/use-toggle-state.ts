import { useCallback, useEffect, useState } from 'react'

/**
 * 토글 상태를 관리하는 커스텀 훅
 *
 * @example
 * // 기본 사용법
 * const [isToggle, { on, off, toggle, set }] = useToggleState(초기값)
 *
 * // 상태 on
 * on()
 *
 * // 상태 off
 * off()
 *
 * // 상태 전환
 * toggle()
 *
 * // 상태 값 직접 설정
 * set(false)
 */

export function useToggleState(initialValue: boolean = true) {
  const [isToggle, setIsToggle] = useState<boolean>(initialValue)

  const on = useCallback(() => setIsToggle(true), [])
  const off = useCallback(() => setIsToggle(false), [])
  const toggle = useCallback(() => setIsToggle(state => !state), [])

  useEffect(() => {
    setIsToggle(initialValue)
  }, [initialValue])

  return [isToggle, { on, off, toggle, set: setIsToggle }] as const
}
