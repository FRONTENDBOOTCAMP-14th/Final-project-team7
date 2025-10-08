'use client'

import { useEffect, useRef, useState } from 'react'

import type { Tables } from '@/lib/supabase/database.types'

type Course = Tables<'course'>
type CourseTable = Pick<Course, 'id' | 'course_name'>

interface DropdownProps {
  courses: CourseTable[]
  selectedCourse: string | 'all'
  onCourseChange: (courseName: string | 'all') => void
}

export default function DropDown({
  courses,
  selectedCourse,
  onCourseChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const allOptions: CourseTable[] = [...courses]

  const selectedIndex = courses.findIndex(
    (option) => option.course_name === selectedCourse
  )

  const selectedCourseName =
    selectedCourse === 'all'
      ? '코스선택'
      : selectedIndex !== -1
        ? `코스 ${selectedIndex + 1} : ${courses[selectedIndex].course_name}`
        : selectedCourse

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0)
    } else {
      setFocusedIndex(-1)
    }
  }, [isOpen])

  useEffect(() => {
    if (listboxRef.current && focusedIndex !== -1) {
      const activeElement = listboxRef.current.children[
        focusedIndex
      ] as HTMLLIElement
      if (activeElement) {
        activeElement.focus({ preventScroll: true })
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDownOnButton = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const handleMoveKey = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const totalOptions = allOptions.length
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % totalOptions)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions)
    } else if (event.key === 'Tab') {
      event.preventDefault()
      if (event.shiftKey) {
        setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions)
      } else {
        setFocusedIndex((prev) => (prev + 1) % totalOptions)
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCourseChange(allOptions[focusedIndex].course_name)
      setIsOpen(false)
      dropdownRef.current?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      dropdownRef.current?.focus()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 버튼 영역 */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex relative z-20 justify-between items-center cursor-pointer border border-gray-300 bg-white p-3 
        text-gray-700 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] rounded"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDownOnButton}
      >
        <span aria-label="코스 이름">{selectedCourseName}</span>
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="14" height="14" fill="url(#pattern0_203_1518)" />
          <defs>
            <pattern
              id="pattern0_203_1518"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <use xlinkHref="#image0_203_1518" transform="scale(0.0111111)" />
            </pattern>
            <image
              id="image0_203_1518"
              width="90"
              height="90"
              preserveAspectRatio="none"
              xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAABV0lEQVR4nO3au0oEQRBG4aNBtfriggjGBvoQBss+kYmB4AXDlYGJxL3q1HT3nA8GzOavwy4ICpIkSZIkSZIkSZIkSZKkepyNT5pL4B74AF6AG6DQrwLcAq/AF/AAXGW8eIi8+fGsOo1dxtt+3vs49YuHr877Ly/uMXbZEnl4PoHzqQe8bXl5T7HLjsibscHk7nYM6CF22RN5MzaoYkirsUtttwXwtGfQGrigHVHrTdUO6/GW6gf2dEMzQ3vY3txg2tzc3PBoaGuzB0QDG5s/JCre1s1BUeGm7g6LirZ0e2BUsCFFzHjoYiLPeXAsLfIchy82cmaAxUfOCGHkhCBGTghj5IRAYeTDxB9CGflIcUIwI58ojghn5KQ/9686/XeHVHHAp9VP8syx10aePraRE2IbOSH22sjTx14b+f8V4Bp4Hp/hZ3+FkyRJkiRJkiRJkiRJkiSR7BvHXxTf38ViRQAAAABJRU5ErkJggg=="
            />
          </defs>
        </svg>
      </div>

      {/* 드롭다운 리스트 */}
      {isOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          ref={listboxRef}
          className="absolute z-10 -mt-2 w-full rounded-b-md border border-gray-300 bg-white py-1 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] outline-none"
          onKeyDown={handleMoveKey}
        >
          {allOptions.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={selectedCourse === option.course_name}
              tabIndex={focusedIndex === index ? 0 : -1}
              className={`py-3 px-6 cursor-pointer hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-300 ${
                index < allOptions.length - 1
                  ? 'border-b border-gray-200 px-6'
                  : ''
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
