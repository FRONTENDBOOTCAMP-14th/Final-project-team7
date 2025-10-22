'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useToggleState } from '@/hooks/use-toggle-state'
import { supabase } from '@/lib/supabase/supabase-client'
import type { CourseOption } from '@/types/running-record/course'

interface DropdownProps {
  selectedCourse: string | 'all'
  onCourseChange: (courseName: string | 'all') => void
}

export default function DropDown({
  selectedCourse,
  onCourseChange,
}: DropdownProps) {
  const [isOpen, { off: close, toggle }] = useToggleState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const listboxRef = useRef<HTMLUListElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        setCourses([])
        return
      }

      setIsAuthenticated(true)

      const { data, error } = await supabase
        .from('course')
        .select('id, course_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setCourses(data)
      }
    }

    fetchCourses()
  }, [])

  const selectedIndex = courses.findIndex(c => c.course_name === selectedCourse)
  const selectedCourseName =
    selectedCourse === 'all'
      ? '코스 선택'
      : selectedIndex !== -1
        ? `코스 ${selectedIndex + 1}: ${courses[selectedIndex].course_name}`
        : selectedCourse

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
    const total = courses.length
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev + 1) % total)
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev - 1 + total) % total)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCourseChange(courses[focusedIndex].course_name)
      close()
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('input[type="date"]')?.focus()
      )
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          toast.error('로그인 후 이용해주세요.')
          window.location.href = '/sign-in'
        }}
        className="w-full px-3 py-3 rounded border border-gray-300 bg-gray-50 text-gray-500 text-center hover:bg-gray-100 transition"
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
        className="relative z-20 flex w-full items-center justify-between rounded border border-gray-300 bg-white p-3 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] cursor-pointer"
      >
        <span>{selectedCourseName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleMoveKey}
          className="absolute z-10 -mt-2 w-full rounded-md border border-gray-300 bg-white outline-none shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
        >
          {courses.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={selectedCourse === option.course_name}
              tabIndex={focusedIndex === index ? 0 : -1}
              className={`px-6 py-3 cursor-pointer hover:bg-gray-100 focus-visible:bg-gray-100 ${
                index < courses.length - 1 ? 'border-b border-gray-200' : ''
              }`}
              onClick={() => {
                onCourseChange(option.course_name)
                close()
                requestAnimationFrame(() =>
                  document
                    .querySelector<HTMLInputElement>('input[type="date"]')
                    ?.focus()
                )
              }}
            >
              {`코스 ${index + 1}: ${option.course_name}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
