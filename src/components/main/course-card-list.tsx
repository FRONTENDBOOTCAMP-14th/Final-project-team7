'use client'
import { useState } from 'react'

import { useCourses } from '@/features/main/course-crud/context'
import type { Course } from '@/lib/supabase'

import CourseCard from './course-card'
import CourseDetailModal from './course-detail-modal'

export function CourseCardList() {
  const { courses } = useCourses()
  const courseList = courses
  const [selected, setSelected] = useState<Course | null>(null)

  if (!Array.isArray(courseList)) {
    // console.log('NOT ARRAY:', courseList)
    return null
  }

  return (
    <>
      <ul className="flex flex-col justify-center inset-0 p-4">
        {courseList.map(course => (
          <li key={course.id}>
            <CourseCard
              course={course}
              onOpenDetail={() => setSelected(course)}
            />
          </li>
        ))}
      </ul>
      <CourseDetailModal course={selected} onClose={() => setSelected(null)} />
    </>
  )
}
