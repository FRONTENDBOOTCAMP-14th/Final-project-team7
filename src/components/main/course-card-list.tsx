'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import CourseCard from '@/components/main/course-card'
import CourseDetailModal from '@/components/main/course-detail-modal'
import CourseEditModal from '@/components/main/course-edit-modal'
import { useCourses } from '@/features/main/course-crud/context'
import type { Course } from '@/lib/supabase'
import { tw } from '@/utils/tw'

export default function CourseCardList() {
  const { courses, loading, error } = useCourses()
  const [selected, setSelected] = useState<Course | null>(null)
  const [editSelect, setEditSelect] = useState<string | null>(null)

  if (error) {
    return <div className="p-4 text-red-600 text-sm">에러: {error}</div>
  }

  if (!Array.isArray(courses)) {
    return null
  }

  return (
    <>
      {loading && (
        <div
          className={tw(`
          flex flex-col items-center justify-center
          w-full max-w-[768px] mx-auto p-4
          min-h-[50vh] gap-4
          bg-white text-gray-800
        `)}
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
            aria-hidden="true"
          />
          <p className="text-gray-500 text-base font-normal">
            열심히 달려오는 중...👟
          </p>
        </div>
      )}

      <ul className="flex flex-col justify-center p-4">
        {!loading && courses.length === 0 ? (
          <li className="w-full py-10 text-center text-gray-500 text-base font-normal">
            코스가 존재하지 않습니다
          </li>
        ) : (
          courses.map(course => (
            <li key={course.id}>
              <CourseCard
                course={course}
                onOpenDetail={() => setSelected(course)}
                onOpenEdit={() => setEditSelect(course.id)}
              />
            </li>
          ))
        )}
      </ul>

      {selected && (
        <CourseDetailModal
          course={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {editSelect && (
        <CourseEditModal
          courseId={editSelect}
          onClose={() => setEditSelect(null)}
        />
      )}
    </>
  )
}
