import { CourseCardList } from '@/components/main/course-card-list'
import { MainHeaderBar } from '@/components/main/main-header-bar'
import { CourseProvider } from '@/features/main/course-crud/context'
import { getInitialCourse } from '@/features/main/course-crud/get-initial-course'

export default async function MainPage() {
  const initialCourseData = await getInitialCourse()
  return (
    <main>
      <CourseProvider initialCourses={initialCourseData}>
        <MainHeaderBar />
        <CourseCardList />
      </CourseProvider>
    </main>
  )
}
