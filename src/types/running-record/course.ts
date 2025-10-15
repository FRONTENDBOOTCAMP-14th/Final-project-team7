import type { Tables } from '@/lib/supabase/database.types'

export type Course = Tables<'course'>
export type CourseOption = Pick<Course, 'id' | 'course_name'>
