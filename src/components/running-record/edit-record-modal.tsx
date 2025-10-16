'use client'

import { CircleArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import DistanceWithTime from '@/components/running-record/common/distance-with-time'
import DropDown from '@/components/running-record/drop-down'
import { useModalFocusTrap } from '@/hooks/running-record'
import { supabase } from '@/lib/supabase/supabase-client'
import type { EditRecordModalProps } from '@/types/running-record'
import {
  calculatePace,
  parseDuration,
  validRecordForm,
} from '@/utils/running-record'

export default function EditRecordModal({
  courses,
  record,
  onClose,
  onUpdateSuccess,
  onDeleteSuccess,
}: EditRecordModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState(record.course_name)
  const [date, setDate] = useState(record.date ?? '')
  const [distance, setDistance] = useState(record.distance ?? '')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [pace, setPace] = useState(record.pace ?? '')

  useModalFocusTrap(modalRef, onClose)

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
      course: selectedCourse,
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

  const handleUpdate = async () => {
    if (!isFormValid) return toast.error('모든 입력 값을 채워주세요.')
    setIsSubmitting(true)

    const { data, error } = await supabase
      .from('running_record')
      .update({
        course_name: selectedCourse,
        date,
        distance,
        duration: `${hours}시간 ${minutes}분 ${seconds}초`,
        pace,
      })
      .eq('id', record.id)
      .select()
      .single()

    setIsSubmitting(false)
    if (error) toast.error('기록 수정 실패')
    else {
      toast.success('기록이 수정되었습니다!')
      onUpdateSuccess(data)
      onClose()
    }
  }

  // 삭제 확인 토스트 커스텀
  const handleDelete = () => {
    toast.custom(
      id => (
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-md">
          <p className="text-sm font-medium text-gray-800">
            정말 이 기록을 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(id)
                setIsDeleting(true)

                const { error } = await supabase
                  .from('running_record')
                  .delete()
                  .eq('id', record.id)

                setIsDeleting(false)

                if (error) {
                  toast.error('기록 삭제 실패했습니다!')
                } else {
                  toast.success('기록이 삭제 되었습니다!')
                  onDeleteSuccess(record.id)
                  onClose()
                }
              }}
              className="flex items-center justify-center px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(id)}
              className="flex items-center justify-center px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm transition"
            >
              취소
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        closeButton: false,
      }
    )
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="overflow-y-auto
        w-[70%]
        max-w-[420px]
        max-h-[80%]
        p-2 bg-white rounded-lg shadow-lg 
        transition-all"
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
          courses={courses}
          selectedCourse={selectedCourse}
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
          disabled={!isFormValid || isSubmitting || isDeleting}
          aria-busy={isSubmitting || isDeleting}
          className={`mt-5 w-full py-2 rounded-md transition-colors ${
            isDeleting
              ? 'bg-red-500 text-white cursor-wait'
              : isFormValid
                ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting || isDeleting ? (
            <Loader2
              className={`mx-auto h-5 w-5 animate-spin ${
                isDeleting ? 'text-white' : 'text-blue-200'
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
