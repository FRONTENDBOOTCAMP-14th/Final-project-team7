'use client'

import { useState } from 'react'

import CourseCard from '@/components/main/course-card'
import CourseDetailModal from '@/components/main/course-detail-modal'
import CourseEditModal from '@/components/main/course-edit-modal'
import { useCourses } from '@/features/main/course-crud/context'
import type { Course } from '@/lib/supabase'

export default function CourseCardList() {
  const { courses, loading, error } = useCourses()
  const [selected, setSelected] = useState<Course | null>(null)
  const [editSelect, setEditSelect] = useState<Course | null>(null)

  if (error)
    return <div className="p-4 text-red-600 text-sm">에러: {error}</div>
  if (!Array.isArray(courses)) return null

  return (
    <>
      {loading && (
        <div className="px-4 py-2 text-sm text-gray-500">불러오는 중…</div>
      )}

      <ul className="flex flex-col justify-center p-4">
        {courses.map(course => (
          <li key={course.id}>
            <CourseCard
              course={course}
              onOpenDetail={() => setSelected(course)}
              onOpenEdit={() => setEditSelect(course.id)}
            />
          </li>
        ))}
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
