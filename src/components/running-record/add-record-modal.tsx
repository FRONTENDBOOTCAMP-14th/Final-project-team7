'use client'

import { CircleArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import DistanceWithTime from '@/components/running-record/common/distance-with-time'
import DropDown from '@/components/running-record/drop-down'
import { useModalFocusTrap } from '@/hooks/running-record'
import { supabase } from '@/lib/supabase/supabase-client'
import type { AddRecordModalProps } from '@/types/running-record'
import { calculatePace, validRecordForm } from '@/utils/running-record/index'

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
    validRecordForm({
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
            aria-label="닫기"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 cursor-pointer"
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
          <label htmlFor="add-record-date" className="sr-only">
            날짜 선택
          </label>
          <input
            id="record-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300  text-gray-700 cursor-pointer"
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
          <p className="text-lg font-semibold">{pace ?? '--:-- / km'}</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isFormValid || isSubmitting}
          aria-busy={isSubmitting}
          className={`mt-5 w-full py-2 rounded-md transition-colors ${
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
