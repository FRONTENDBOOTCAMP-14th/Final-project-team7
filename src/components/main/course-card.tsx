import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import DetailButton from '@/components/main/detail-button'
import KakaoMap from '@/components/main/kakao-map'
import type { Course } from '@/lib/supabase'
import { tw } from '@/utils/tw'

import { useCourses } from '../../features/main/course-crud/context'

interface LatLng {
  lat: number
  lng: number
}
type Path = LatLng[]

function toPath(input: unknown): Path {
  if (!input) return []

  if (
    Array.isArray(input) &&
    input.every(
      p => p && typeof p.lat === 'number' && typeof p.lng === 'number'
    )
  ) {
    return input as Path
  }

  if (Array.isArray(input) && Array.isArray(input[0])) {
    const flat = input.flat()
    if (
      flat.every(
        p => p && typeof p.lat === 'number' && typeof p.lng === 'number'
      )
    ) {
      return flat as Path
    }
  }

  if (
    Array.isArray(input) &&
    input.every(p => p && typeof p.x === 'number' && typeof p.y === 'number')
  ) {
    return input.map(p => ({ lat: p.y, lng: p.x }))
  }
  return []
}

export default function CourseCard({
  course,
  onOpenDetail,
  onOpenEdit,
}: {
  course: Course
  onOpenDetail: () => void
  onOpenEdit: () => void
}) {
  const year = course.created_at.slice(0, 4)
  const month = course.created_at.slice(5, 7)
  const day = course.created_at.slice(8, 10)

  const { removeCourse, refresh } = useCourses()

  async function handleDelete() {
    if (!window.confirm(`[${course.course_name}] 코스를 삭제하시겠습니까?`))
      return
    const ok = await removeCourse(course.id)
    if (!ok) return toast.error('코스 삭제에 실패했습니다.')
    toast.success('코스가 삭제되었습니다.')
    await refresh()
  }

  return (
    <div
      className={tw`
        flex flex-col items-start shrink-0 relative
        mx-auto mb-4 p-6 w-[362px] min-w-[288px] h-[360px] rounded-md
        bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.25)]
        `}
    >
      <div className="flex gap-2 absolute right-4 text-[14px]">
        <button
          type="button"
          aria-label="코스 수정"
          onClick={onOpenEdit}
          className="hover:text-blue-400 cursor-pointer"
        >
          <Pencil />
        </button>
        <button
          type="button"
          aria-label="코스 삭제"
          onClick={handleDelete}
          className="hover:text-red-500 cursor-pointer"
        >
          <Trash2 />
        </button>
      </div>
      <h3 className="mb-2.5 text-[var(--color-basic-400)] text-[18px] font-semibold">
        {course.course_name}
      </h3>
      <p className="mb-2.5 text-[var(--color-basic-400)] text-[14px] font-normal">
        {course.course_desc}
      </p>
      <DetailButton onOpen={onOpenDetail} />
      <div className="w-[314px] h-[140px]">
        <KakaoMap coordData={toPath(course.course_map)} />
      </div>
      <div className="relative w-full h-12">
        <span className="absolute right-0 bottom-0 text-gray-400 font-medium text-[14px]">{`코스 생성 : ${year}년 ${month}월 ${day}일`}</span>
      </div>
    </div>
  )
}
