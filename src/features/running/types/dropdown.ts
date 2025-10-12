import type { CourseOption } from './course'

export interface DropdownProps {
  courses: CourseOption[]
  selectedCourse: string | 'all'
  onCourseChange: (courseName: string | 'all') => void
}
