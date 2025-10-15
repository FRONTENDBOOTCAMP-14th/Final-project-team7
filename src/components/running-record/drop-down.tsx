'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useToggleState } from '@/hooks/use-toggle-state'
import type { CourseOption, DropdownProps } from '@/types/running-record'

export default function DropDown({
  courses,
  selectedCourse,
  onCourseChange,
}: DropdownProps) {
  const [isOpen, { on: open, off: close, toggle }] = useToggleState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const listboxRef = useRef<HTMLUListElement | null>(null)

  const allOptions: CourseOption[] = [...courses]

  const selectedIndex = courses.findIndex(c => c.course_name === selectedCourse)

  const selectedCourseLabel =
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

  const handleKeyDownOnButton = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      open()
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
      close()

      requestAnimationFrame(() => {
        const dateInputfocus =
          document.querySelector<HTMLInputElement>('input[type="date"]')
        dateInputfocus?.focus()
      })
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
      dropdownRef.current?.focus()
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [close])

  return (
    <div ref={dropdownRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={handleKeyDownOnButton}
        className="relative z-20 flex items-center justify-between rounded border border-gray-300 bg-white p-3 shadow-[0_0_10px_0_rgba(0,0,0,0.25)] cursor-pointer transition"
      >
        <span aria-label="코스 이름">{selectedCourseLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </div>
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
              className={`px-6 py-3 cursor-pointer hover:bg-gray-100 focus-visible:bg-gray-100 ${index < allOptions.length - 1 ? 'border-b border-gray-200' : ''}`}
              onClick={() => {
                onCourseChange(option.course_name)
                close()

                requestAnimationFrame(() => {
                  const dateInputfocus =
                    document.querySelector<HTMLInputElement>(
                      'input[type="date"]'
                    )
                  dateInputfocus?.focus()
                })
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
