'use client'

import { ChevronDown, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useToggleState } from '@/hooks/use-toggle-state'
import { supabase } from '@/lib/supabase/supabase-client'
import type { CourseOption } from '@/types/running-record/course'

interface DropdownProps {
  selectedCourse: string | 'all'
  onCourseChange: (courseId: string | 'all') => void
}

export default function DropDown({
  selectedCourse,
  onCourseChange,
}: DropdownProps) {
  const [isOpen, { off: close, toggle }] = useToggleState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const listboxRef = useRef<HTMLUListElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsAuthenticated(false)
          setCourses([])
          setLoading(false)
          return
        }

        setIsAuthenticated(true)

        const { data, error } = await supabase
          .from('course')
          .select('id, course_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (!error && data) setCourses(data)
        else toast.error('코스 데이터를 불러오지 못했습니다')
      } catch {
        toast.error('코스 정보를 불러오는 중 오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const selectedCourseName =
    selectedCourse === 'all'
      ? '코스 선택'
      : (() => {
          const index = courses.findIndex(c => c.id === selectedCourse)
          if (index === -1) return '코스 선택'
          return `코스 ${index + 1}: ${courses[index].course_name}`
        })()

  const visibleCourses =
    selectedCourse === 'all'
      ? courses
      : courses.filter(course => course.id !== selectedCourse)

  // ✅ 포커스
  useEffect(() => {
    if (isOpen) setFocusedIndex(0)
    else setFocusedIndex(-1)
  }, [isOpen])

  useEffect(() => {
    if (listboxRef.current && focusedIndex !== -1) {
      const active = listboxRef.current.children[focusedIndex] as HTMLLIElement
      active?.focus({ preventScroll: true })
      active?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [close])

  const handleMoveKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const total = visibleCourses.length
    if (total === 0) return
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev + 1) % total)
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev - 1 + total) % total)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCourseChange(visibleCourses[focusedIndex].id)
      close()
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('input[type="date"]')?.focus()
      )
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  if (loading) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          disabled
          className="relative z-20 flex w-full items-center justify-center p-3 bg-white rounded border border-gray-300 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-gray-500 cursor-wait"
        >
          <Loader2
            className="h-5 w-5 animate-spin text-gray-500"
            aria-label="로딩중"
          />
          <span className="ml-2 text-sm">코스 목록을 불러오는 중...</span>
        </button>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          toast.error('로그인 후 이용해주세요.')
          window.location.href = '/sign-in'
        }}
        className="w-full px-3 py-3 rounded border bg-gray-50 hover:bg-gray-100 border-gray-300  text-gray-500 text-center transition"
      >
        로그인 후 이용 가능합니다
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggle}
        className="relative z-20 flex w-full items-center justify-between p-3 bg-white rounded border border-gray-300 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] cursor-pointer"
      >
        <span>{selectedCourseName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </button>

      {/* 리스트 */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleMoveKey}
          className="absolute z-10 -mt-2 w-full bg-white rounded-md border border-gray-300 outline-none shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
        >
          {visibleCourses.length > 0 ? (
            visibleCourses.map((option, index) => (
              <li
                key={option.id}
                role="option"
                aria-selected={selectedCourse === option.id}
                tabIndex={focusedIndex === index ? 0 : -1}
                className={`px-6 py-3 hover:bg-gray-100 focus-visible:bg-gray-100 cursor-pointer ${
                  index < visibleCourses.length - 1
                    ? 'border-b border-gray-200'
                    : ''
                }`}
                onClick={() => {
                  onCourseChange(option.id)
                  close()
                  requestAnimationFrame(() =>
                    document
                      .querySelector<HTMLInputElement>('input[type="date"]')
                      ?.focus()
                  )
                }}
              >
                {`코스 ${courses.findIndex(c => c.id === option.id) + 1}: ${option.course_name}`}
              </li>
            ))
          ) : (
            <li className="px-6 py-3 text-gray-500 text-sm text-center">
              등록된 코스가 없습니다
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
