import type { Course } from '@/lib/supabase'

import DetailButton from './detail-button'
import KakaoMap from './kakao-map'

// import RecentRecord from './recent-record'

export default function CourseCard({
  course,
  onOpenDetail,
}: {
  course: Course
  onOpenDetail: () => void
}) {
  return (
    <div className="flex flex-col items-start bg-white mx-auto mb-4 p-6 w-[362px] min-w-[288px] h-[396px] rounded-md shrink-0 shadow-[0_0_10px_0_rgba(0,0,0,0.25)]">
      <h3 className="text-[#202020] text-[18px] font-semibold mb-2.5">
        {course.course_name}
      </h3>
      <p className="mb-2.5 text-[#202020] text-[14px] font-normal">
        {course.course_desc}
      </p>
      <DetailButton onOpen={onOpenDetail} />
      <div className="w-[314px]">
        <KakaoMap />
      </div>
      {/* <div>
        <RecentRecord courses={courses ?? []} records={records ?? []} />
      </div> */}
    </div>
  )
}
