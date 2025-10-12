'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { CourseOption } from '@/features/running/types/course'
import type { DropdownProps } from '@/features/running/types/dropdown'

export default function DropDown({
  courses,
  selectedCourse,
  onCourseChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const listboxRef = useRef<HTMLUListElement | null>(null)

  // 전체 코스 목록
  const allOptions: CourseOption[] = [...courses]

  const selectedIndex = courses.findIndex(c => c.course_name === selectedCourse)

  const selectedCourseLabel =
    selectedCourse === 'all'
      ? '코스 선택'
      : selectedIndex !== -1
        ? `코스 ${selectedIndex + 1}: ${courses[selectedIndex].course_name}`
        : selectedCourse

  // 포커스 관리
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

  // 키보드 이벤트
  const handleKeyDownOnButton = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  const handleMoveKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const total = allOptions.length
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev + 1) % total)
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      setFocusedIndex(prev => (prev - 1 + total) % total)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCourseChange(allOptions[focusedIndex].course_name)
      setIsOpen(false)
      dropdownRef.current?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      dropdownRef.current?.focus()
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDownOnButton}
        className="flex relative z-20 justify-between items-center border border-gray-300 bg-white p-3 rounded cursor-pointer transition shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
      >
        <span aria-label="코스 이름">{selectedCourseLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* 코스 리스트 */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleMoveKey}
          className="absolute z-10 -mt-2 w-full rounded-md border border-gray-300 bg-white outline-none shadow-[0_0_10px_0_rgba(0,0,0,0.25)]"
        >
          {allOptions.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={selectedCourse === option.course_name}
              tabIndex={focusedIndex === index ? 0 : -1}
              className={`px-6 py-3 cursor-pointer hover:bg-gray-100 focus-visible:bg-gray-100 ${
                index < allOptions.length - 1 ? 'border-b border-gray-200' : ''
              }`}
              onClick={() => {
                onCourseChange(option.course_name)
                setIsOpen(false)
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
