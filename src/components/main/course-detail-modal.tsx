import { CircleX } from 'lucide-react'
import Image from 'next/image'

import KakaoMap from '@/components/main/kakao-map'
import type { Course } from '@/lib/supabase'

interface CourseDetailModalProps {
  onClose: () => void
  course: Course
}

export default function CourseDetailModal({
  onClose,
  course,
}: CourseDetailModalProps) {
  if (!course) return null

  const year = course.created_at.slice(0, 4)
  const month = course.created_at.slice(5, 7)
  const day = course.created_at.slice(8, 10)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-xs">
      <div className="relative w-[400px] bg-white rounded-lg shadow-lg overflow-scroll">
        <div className="flex items-center pt-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="뒤로가기"
          >
            <CircleX />
          </button>
        </div>
        <div className="flex flex-col p-6">
          <h3 className="mb-2.5 text-[#202020] text-[18px] font-semibold">
            {course.course_name}
          </h3>
          <p className="mb-2.5 text-[#202020] text-[14px] font-normal">
            {course.course_desc}
          </p>
          <div className="flex flex-row-reverse pb-2 w-full">
            <span className="text-gray-400 font-medium text-[14px]">{`코스 생성 : ${year}년 ${month}월 ${day}일`}</span>
          </div>
          {course.image ? (
            <Image
              src={course.image}
              alt="코스 이미지"
              width={200}
              height={200}
              className="mx-auto rounded-md object-contain"
              unoptimized
            />
          ) : (
            <div className="mb-[10px] p-4 border-2 border-gray-400 rounded-md text-center">
              <span className="text-[14px] text-center">
                등록된 이미지가 없습니다.
              </span>
            </div>
          )}
          <div className="mx-auto my-2 w-[314px] h-[300px]">
            <KakaoMap coordData={course.course_map} />
          </div>
        </div>
      </div>
    </div>
  )
}
