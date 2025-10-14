'use client'

import { CircleArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  calculatePace,
  parseDuration,
} from '@/features/running/utils/pace-utils'
import { supabase } from '@/lib/supabase/supabase-client'

import { useModalFocusTrap } from '../hooks'
import type { EditRecordModalProps } from '../types'
import { isValidRecordForm } from '../utils'

import InputTimeWithLabel from './common/input-time-with-label'
import DropDown from './drop-down'

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
    isValidRecordForm({
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

  // 기록삭제 여부 Toast 커스텀
  const handleDelete = () => {
    toast.custom(
      id => (
        <div className="flex flex-col gap-3 p-3">
          <p className="text-sm font-medium text-gray-800">
            정말 이 기록을 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <button
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
              className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
              삭제
            </button>
            <button
              onClick={() => toast.dismiss(id)}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 transition"
            >
              취소
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        closeButton: false,
        classNames: {
          toast: 'rounded-lg shadow-md border border-gray-200 bg-white',
        },
      }
    )
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          bg-white rounded-lg shadow-lg
          w-[80vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw]
          max-w-[800px] min-w-[280px]
          max-h-[90vh] overflow-y-auto
          p-5 sm:p-6 md:p-8
        "
      >
        <div className="flex justify-between items-center pb-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기 버튼"
            className="cursor-pointer rounded hover:bg-gray-200 p-1"
          >
            <CircleArrowLeft size={28} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="삭제하기 버튼"
            disabled={isDeleting}
            className="cursor-pointer text-red-500 rounded p-1 hover:bg-gray-200 disabled:opacity-50"
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
          <label className="text-gray-700" aria-label="날짜 선택" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-700 cursor-pointer"
          />
        </div>

        <div className="mt-3">
          <InputTimeWithLabel
            label="km"
            value={distance}
            onChange={setDistance}
            placeholder="거리"
            type="number"
          />
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-3">
          <InputTimeWithLabel
            label="시간"
            value={hours}
            onChange={setHours}
            type="number"
            placeholder="0"
          />
          <InputTimeWithLabel
            label="분"
            value={minutes}
            onChange={setMinutes}
            type="number"
            placeholder="0"
          />
          <InputTimeWithLabel
            label="초"
            value={seconds}
            onChange={setSeconds}
            type="number"
            placeholder="0"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm sm:text-base">km 페이스</p>
          <p className="text-lg font-semibold">{pace || '--:-- / km'}</p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={!isFormValid || isSubmitting || isDeleting}
          className={`w-full mt-5 py-2 sm:py-3 rounded-md transition-colors cursor-pointer ${
            isDeleting
              ? 'bg-red-500 text-white cursor-wait'
              : isFormValid
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting || isDeleting ? (
            <Loader2
              className={`w-5 h-5 animate-spin mx-auto ${
                isDeleting ? 'text-white' : 'text-blue-200'
              }`}
            />
          ) : (
            '저장하기'
          )}
        </button>
      </div>
    </div>
  )
}
