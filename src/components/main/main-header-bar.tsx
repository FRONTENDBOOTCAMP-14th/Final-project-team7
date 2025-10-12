import { AddCourseButton } from './add-course-button'
import { SortDropdown } from './sort-dropdown'

export function MainHeaderBar() {
  return (
    <div className="flex justify-between px-[15px] py-5">
      <SortDropdown />
      <AddCourseButton />
    </div>
  )
}
