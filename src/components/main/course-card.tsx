'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import DetailButton from '@/components/main/detail-button'
import KakaoMap from '@/components/main/kakao-map'
import { useCourses } from '@/features/main/course-crud/context'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

interface LatLng {
  lat: number
  lng: number
}
type Path = LatLng[]

// user_id를 선택적(optional)으로 바꿔줌
type CourseWithOwner = Course & {
  user_id?: string
}

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

interface CourseCardProps {
  course: CourseWithOwner
  onOpenDetail: () => void
  onOpenEdit: () => void
}

export default function CourseCard({
  course,
  onOpenDetail,
  onOpenEdit,
}: CourseCardProps) {
  const year = course.created_at.slice(0, 4)
  const month = course.created_at.slice(5, 7)
  const day = course.created_at.slice(8, 10)

  const { removeCourse, refresh } = useCourses()

  const [ownerName, setOwnerName] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchOwnerName() {
      if (!course.user_id) {
        if (!isMounted) return
        setOwnerName('알 수 없음')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_name')
        .eq('id', course.user_id)
        .single()

      if (!isMounted) return

      if (error) {
        setOwnerName('알 수 없음')
        return
      }

      setOwnerName(data?.user_name ?? '알 수 없음')
    }

    fetchOwnerName()

    return () => {
      isMounted = false
    }
  }, [course.user_id])

  useEffect(() => {
    let isMounted = true

    async function fetchCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return
      setCurrentUserId(user?.id ?? null)
    }

    fetchCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleDelete() {
    const ok = window.confirm(
      `[${course.course_name}] 코스를 삭제하시겠습니까?`
    )
    if (!ok) return

    const success = await removeCourse(course.id)
    if (!success) {
      toast.error('코스 삭제에 실패했습니다.')
      return
    }

    toast.success('코스가 삭제되었습니다.')
    await refresh()
  }

  const isOwner = currentUserId === course.user_id

  const createdDateStr = `${year}년 ${month}월 ${day}일`
  const metaInfo = ownerName
    ? `${ownerName} • ${createdDateStr}`
    : `${createdDateStr}`

  return (
    <div
      className={tw`
        flex flex-col items-start shrink-0 relative
        mx-auto mb-4 p-6 w-[362px] min-w-[288px] h-[360px] rounded-md
        bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.25)]
      `}
    >
      {isOwner && (
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
      )}
      <h3 className="mb-1 text-[var(--color-basic-400)] text-[18px] font-semibold">
        {course.course_name}
      </h3>
      <p
        className={tw(`
          mb-2.5
          text-[var(--color-basic-400)] text-[14px] font-normal break-words
        `)}
      >
        {course.course_desc}
      </p>
      <DetailButton onOpen={onOpenDetail} />
      <div className="w-[314px] h-[140px]">
        <KakaoMap coordData={toPath(course.course_map)} />
      </div>
      <div className="relative w-full h-12">
        <span className="absolute right-0 bottom-0 text-gray-400 font-medium text-[14px]">
          {metaInfo}
        </span>
      </div>
    </div>
  )
}
