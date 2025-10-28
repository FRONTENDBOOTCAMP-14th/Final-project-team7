'use client'
import AddCourseButton from '@/components/main/add-course-button'
import SortDropdown from '@/components/main/sort-dropdown'
import { useCourses } from '@/features/main/course-crud/context'

export default function MainHeaderBar() {
  const { sortKey, setSortKey } = useCourses()
  return (
    <div className="flex justify-between px-[15px] py-5">
      <SortDropdown value={sortKey} onChange={setSortKey} />
      <AddCourseButton />
    </div>
  )
}
