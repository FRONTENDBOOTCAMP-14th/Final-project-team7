'use client'

import { CircleArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import InputTimeWithLabel from '@/components/running-record/common/input-time-with-label'
import DropDown from '@/components/running-record/drop-down'
import { useModalFocusTrap } from '@/hooks/running-record'
import { supabase } from '@/lib/supabase/supabase-client'
import type { AddRecordModalProps } from '@/types/running-record'
import { calculatePace, isValidRecordForm } from '@/utils/running-record'

export default function AddRecordModal({
  courses,
  onClose,
  onAddSuccess,
}: AddRecordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState<'all' | string>('all')
  const [date, setDate] = useState('')
  const [distance, setDistance] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [pace, setPace] = useState<string | null>(null)

  useModalFocusTrap(modalRef, onClose)

  useEffect(() => {
    const paceValue = calculatePace(distance, hours, minutes, seconds)
    setPace(paceValue === '--:-- / km' ? null : paceValue)
  }, [distance, hours, minutes, seconds])

  const isTimeFilled = hours.trim() && minutes.trim() && seconds.trim()
  const isFormValid =
    isValidRecordForm({
      course: selectedCourse,
      date,
      distance,
      hours,
      minutes,
      seconds,
      pace,
    }) && isTimeFilled

  const handleSave = async () => {
    if (!isFormValid) return toast.error('모든 입력 값을 채워주세요.')

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from('running_record')
      .insert([
        {
          course_name: selectedCourse,
          date,
          distance,
          duration: `${hours}시간 ${minutes}분 ${seconds}초`,
          pace,
        },
      ])
      .select()
      .single()
    setIsSubmitting(false)

    if (error) toast.error('기록 추가에 실패했습니다.')
    else {
      toast.success('기록이 추가되었습니다!')
      onAddSuccess(data)
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
        overflow-y-auto
        w-[320px] md:w-[768px] xl:max-w-[1280px]
        h-[550px] md:max-h-[600px] xl:max-h-[800px]
        bg-white rounded-lg shadow-lg p-5
        transition-all
      "
      >
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-200 cursor-pointer"
          >
            <CircleArrowLeft size={28} />
          </button>
        </div>

        <DropDown
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
        />

        <div className="mt-3">
          <label htmlFor="record-date" className="sr-only">
            날짜 선택
          </label>
          <input
            id="record-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700 cursor-pointer"
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

        <div className="flex flex-col md:grid md:grid-cols-3 mt-3 gap-2">
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
          <p className="text-sm">km 페이스</p>
          <p className="text-lg font-semibold">{pace ?? '--:-- / km'}</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isFormValid || isSubmitting}
          aria-busy={isSubmitting}
          className={`mt-5 w-full rounded-md py-2 md:py-3 transition-colors ${
            isFormValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <Loader2
              className="mx-auto h-5 w-5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            '추가하기'
          )}
        </button>
      </div>
    </div>
  )
}
