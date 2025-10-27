'use client'

import { CircleArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import DistanceWithTime from '@/components/running-record/common/distance-with-time'
import DropDown from '@/components/running-record/drop-down'
import useModalFocusTrap from '@/hooks/running-record/use-modal-focus-trap'
import { supabase } from '@/lib/supabase/supabase-client'
import type { CourseOption } from '@/types/running-record/course'
import type { EditRecordModalProps } from '@/types/running-record/record-table-props'
import {
  calculatePace,
  parseDuration,
  validRecordForm,
} from '@/utils/running-record'
import { tw } from '@/utils/tw'

export default function EditRecordModal({
  record,
  onClose,
  onUpdateSuccess,
  onDeleteSuccess,
}: Omit<EditRecordModalProps, 'courses'>) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    record.course_id
  )
  const [date, setDate] = useState(record.date ?? '')
  const [distance, setDistance] = useState(record.distance ?? '')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [pace, setPace] = useState(record.pace ?? '')

  useModalFocusTrap(modalRef, onClose)

  useEffect(() => {
    const fetchCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('course')
        .select('id, course_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        toast.error('코스 목록을 불러오지 못했습니다')
      } else if (data) {
        setCourses(data)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    if (!record.duration) return
    const { hours: h, minutes: m, seconds: s } = parseDuration(record.duration)
    setHours(h)
    setMinutes(m)
    setSeconds(s)
  }, [record])

  useEffect(() => {
    const paceValue = calculatePace(distance, hours, minutes, seconds)
    setPace(paceValue === '--:-- / km' ? '' : paceValue)
  }, [distance, hours, minutes, seconds])

  const isFormValid =
    validRecordForm({
      course: selectedCourse ?? '',
      date,
      distance,
      hours,
      minutes,
      seconds,
      pace,
    }) &&
    hours &&
    minutes &&
    seconds

  const isCoursesLoading = courses.length === 0
  const isLoadingState = isSubmitting || isDeleting || isCoursesLoading

  const handleUpdate = async () => {
    if (!isFormValid) return toast.error('모든 입력 값을 채워주세요')
    setIsSubmitting(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error('로그인된 사용자만 수정할 수 있습니다')
      setIsSubmitting(false)
      return
    }

    const selectedCourseData = courses.find(c => c.id === selectedCourse)
    if (!selectedCourseData) {
      toast.error('코스를 선택해주세요')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('running_record')
      .update({
        course_id: selectedCourseData.id,
        course_name: selectedCourseData.course_name,
        date,
        distance,
        duration: `${hours}시간 ${minutes}분 ${seconds}초`,
        pace,
      })
      .eq('id', record.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle()

    setIsSubmitting(false)

    if (error) {
      toast.error('기록 수정 실패했습니다')
    } else if (data) {
      toast.success('기록이 수정되었습니다')
      onUpdateSuccess(data)
      onClose()
    } else {
      toast.error('수정할 수 있는 기록을 찾지 못했습니다')
    }
  }

  const handleDelete = async () => {
    toast.custom(
      id => (
        <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-md">
          <p className="text-sm font-medium text-gray-800">
            정말 이 기록을 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(id)
                setIsDeleting(true)
                const {
                  data: { user },
                } = await supabase.auth.getUser()

                const { error } = await supabase
                  .from('running_record')
                  .delete()
                  .eq('id', record.id)
                  .eq('user_id', user?.id)

                setIsDeleting(false)

                if (error) {
                  toast.error('기록 삭제 실패했습니다')
                } else {
                  toast.success('기록이 삭제되었습니다')
                  onDeleteSuccess(record.id)
                  onClose()
                }
              }}
              className={tw(`
                flex items-center justify-center
                px-3 py-1 rounded 
                bg-red-500 hover:bg-red-600 
                text-white text-sm 
                transition cursor-pointer
              `)}
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(id)}
              className={tw(`
                flex items-center justify-center 
                px-3 py-1 bg-gray-200 hover:bg-gray-300 
                rounded 
                text-sm 
                transition cursor-pointer
              `)}
            >
              취소
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="overflow-y-auto
        w-[70%] max-w-[420px] max-h-[80%]
        p-2 bg-white rounded-lg shadow-lg
        transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기 버튼"
            className="p-1 rounded hover:bg-gray-200 cursor-pointer"
          >
            <CircleArrowLeft size={28} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="삭제하기 버튼"
            disabled={isDeleting}
            className="p-1 rounded hover:bg-gray-200 text-red-500 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={28} />
          </button>
        </div>

        <DropDown
          selectedCourse={selectedCourse ?? 'all'}
          onCourseChange={setSelectedCourse}
        />

        <div className="mt-3">
          <label htmlFor="edit-record-date" className="sr-only">
            날짜 선택
          </label>
          <input
            id="edit-record-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 text-gray-700 cursor-pointer"
          />
        </div>

        <div className="mt-3">
          <DistanceWithTime
            id="record-distance"
            label="거리"
            value={distance}
            onChange={setDistance}
            placeholder="0"
            type="number"
          />
        </div>

        <div className="flex mt-3 gap-2">
          <DistanceWithTime
            id="record-hours"
            label="시"
            value={hours}
            onChange={setHours}
            type="number"
            placeholder="0"
          />
          <DistanceWithTime
            id="record-minutes"
            label="분"
            value={minutes}
            onChange={setMinutes}
            type="number"
            placeholder="0"
          />
          <DistanceWithTime
            id="record-seconds"
            label="초"
            value={seconds}
            onChange={setSeconds}
            type="number"
            placeholder="0"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm">km 페이스</p>
          <p className="text-lg font-semibold">{pace || '--:-- / km'}</p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={!isFormValid || isLoadingState}
          aria-busy={isLoadingState}
          className={`mt-5 w-full py-2 rounded-md transition-colors
            ${
              isCoursesLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDeleting
                  ? 'bg-red-500 text-white cursor-wait'
                  : isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isFormValid
                      ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLoadingState ? (
            <Loader2
              className={`mx-auto h-5 w-5 animate-spin ${
                isDeleting ? 'text-white' : 'text-gray-600'
              }`}
              aria-hidden="true"
            />
          ) : (
            '저장하기'
          )}
        </button>
      </div>
    </div>
  )
}
