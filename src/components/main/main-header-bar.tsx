'use client'
import { useCourses } from '../../features/main/course-crud/context'

import { AddCourseButton } from './add-course-button'
import { SortDropdown } from './sort-dropdown'

export function MainHeaderBar() {
  const { sortKey, setSortKey } = useCourses()
  return (
    <div className="flex justify-between px-[15px] py-5">
      <SortDropdown value={sortKey} onChange={setSortKey} />
      <AddCourseButton />
    </div>
  )
}
