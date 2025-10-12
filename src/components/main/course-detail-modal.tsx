import { CircleX } from 'lucide-react'
import Image from 'next/image'

import type { Course } from '@/lib/supabase'

interface CourseDetailModalProps {
  onClose: () => void
  course: Course
}

export default function CourseDetailModal({
  onClose,
  course,
}: CourseDetailModalProps) {
  if (!course) return null

  const path = normalizePath(course.course_map)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
      <div className="relative bg-white w-[400px] rounded-lg shadow-lg overflow-scroll">
        {/* 상단 헤더 */}
        <div className="flex items-center pt-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="뒤로가기"
          >
            <CircleX />
          </button>
        </div>
        <div className="flex flex-col p-6">
          <h3 className="text-[#202020] text-[18px] font-semibold mb-2.5">
            {course.course_name}
          </h3>
          <p className="mb-2.5 text-[#202020] text-[14px] font-normal">
            {course.course_desc}
          </p>
          {course.image ? (
            <Image
              src={course.image}
              alt="코스 이미지"
              width={300}
              height={300}
              className="rounded-md object-contain"
              unoptimized
            />
          ) : (
            <div className="border-2 border-gray-400 rounded-md p-4 mb-[10px] text-center">
              <span className="text-[14px] text-center">
                등록된 이미지가 없습니다.
              </span>
            </div>
          )}
          {path}
        </div>
      </div>
    </div>
  )
}

interface LatLng {
  lat: number
  lng: number
}
type CoursePath = LatLng[][]

function normalizePath(input: unknown): CoursePath | null {
  if (!input) return null
  // 이미 배열이면 그대로
  if (Array.isArray(input)) return input as CoursePath
  // 문자열(JSON)일 수 있음
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return Array.isArray(parsed) ? (parsed as CoursePath) : null
    } catch {
      return null
    }
  }
  return null
}
