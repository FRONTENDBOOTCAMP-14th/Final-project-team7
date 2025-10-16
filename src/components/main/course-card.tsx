import type { Course } from '@/lib/supabase'
import { tw } from '@/utils/tw'

import DetailButton from './detail-button'
import KakaoMap from './kakao-map'

export default function CourseCard({
  course,
  onOpenDetail,
}: {
  course: Course
  onOpenDetail: () => void
}) {
  const year = course.created_at.slice(0, 4)
  const month = course.created_at.slice(5, 7)
  const day = course.created_at.slice(8, 10)

  return (
    <div
      className={tw`
        flex flex-col items-start shrink-0
        mx-auto mb-4 p-6 w-[362px] min-w-[288px] h-[360px] rounded-md
        bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.25)]
        `}
    >
      <h3 className="text-[#202020] text-[18px] font-semibold mb-2.5">
        {course.course_name}
      </h3>
      <p className="mb-2.5 text-[#202020] text-[14px] font-normal">
        {course.course_desc}
      </p>
      <DetailButton onOpen={onOpenDetail} />
      <div className="w-[314px] h-[140px]">
        <KakaoMap coordData={course.course_map} />
      </div>
      <div className="relative w-full h-12">
        <span className="absolute text-gray-400 font-medium text-[14px] right-0 bottom-0">{`코스 생성 : ${year}년 ${month}월 ${day}일`}</span>
      </div>
    </div>
  )
}
