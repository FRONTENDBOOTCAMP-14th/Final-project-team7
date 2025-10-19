import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 클래스명을 병합하는 유틸리티 함수
 * clsx : 조건부 클래스명 처리
 * tailwind-merge : 충돌 해결
 */
export function tw(...classNames: ClassValue[]) {
  return twMerge(clsx(...classNames))
}
