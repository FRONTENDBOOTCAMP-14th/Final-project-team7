'use client'

import { CircleX } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

import KakaoMap from '@/components/main/kakao-map'
import type { Course } from '@/lib/supabase'

interface CourseDetailModalProps {
  onClose: () => void
  course: Course
}

interface LatLng {
  lat: number
  lng: number
}
type Path = LatLng[]

function toPath(input: unknown): Path {
  if (!input) return []
  if (
    Array.isArray(input) &&
    input.every(
      p => p && typeof p.lat === 'number' && typeof p.lng === 'number'
    )
  ) {
    return input as Path
  }
  if (Array.isArray(input) && Array.isArray(input[0])) {
    const flat = input.flat()
    if (
      flat.every(
        p => p && typeof p.lat === 'number' && typeof p.lng === 'number'
      )
    ) {
      return flat as Path
    }
  }
  if (
    Array.isArray(input) &&
    input.every(p => p && typeof p.x === 'number' && typeof p.y === 'number')
  ) {
    return input.map(p => ({ lat: p.y, lng: p.x }))
  }
  return []
}

export default function CourseDetailModal({
  onClose,
  course,
}: CourseDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string>('')

  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null
    previousOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus()
    }

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const n = modalRef.current
        if (!n) return
        const focusable = Array.from(
          n.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter(
          el =>
            !el.hasAttribute('disabled') &&
            el.tabIndex !== -1 &&
            !el.getAttribute('aria-hidden')
        )
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || !n.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflowRef.current
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus()
      }
    }
  }, [onClose])

  if (!course) return null

  const year = course.created_at.slice(0, 4)
  const month = course.created_at.slice(5, 7)
  const day = course.created_at.slice(8, 10)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-xs"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative bg-white w-[400px] max-h-[80vh] rounded-lg shadow-lg overflow-y-auto"
      >
        <div className="flex items-center p-4">
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
            aria-label="닫기"
          >
            <CircleX />
          </button>
        </div>

        <div className="flex flex-col p-6">
          <h3 className="mb-2.5 text-[var(--color-basic-400)] text-[18px] font-semibold">
            {course.course_name}
          </h3>

          <p className="mb-2.5 text-[var(--color-basic-400)] text-[14px] font-normal">
            {course.course_desc}
          </p>

          <div className="flex flex-row-reverse pb-2 w-full">
            <span className="text-gray-400 font-medium text-[14px]">
              {`코스 생성 : ${year}년 ${month}월 ${day}일`}
            </span>
          </div>

          {course.image ? (
            <Image
              src={course.image}
              alt="코스 이미지"
              width={200}
              height={200}
              className="mx-auto rounded-md object-contain"
              unoptimized
            />
          ) : (
            <div className="mb-[10px] p-4 border-2 border-gray-400 rounded-md text-center">
              <span className="text-[14px] text-center">
                등록된 이미지가 없습니다.
              </span>
            </div>
          )}

          <div className="mx-auto my-2 w-[314px] h-[300px]">
            <KakaoMap coordData={toPath(course.course_map)} />
          </div>
        </div>
      </div>
    </div>
  )
}
