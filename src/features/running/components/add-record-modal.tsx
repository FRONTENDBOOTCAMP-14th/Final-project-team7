'use client'

import { CircleArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

import { useModalFocusTrap } from '../hooks'
import type { AddRecordModalProps } from '../types'
import { calculatePace, isValidRecordForm } from '../utils'

import InputTimeWithLabel from './common/input-time-with-label'
import DropDown from './drop-down'

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
      className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
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
            aria-label="닫기"
            onClick={onClose}
            className="cursor-pointer rounded hover:bg-gray-200 p-1"
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
          <p className="text-lg font-semibold">{pace ?? '--:-- / km'}</p>
        </div>

        <button
          onClick={handleSave}
          disabled={!isFormValid || isSubmitting}
          className={`w-full mt-5 py-2 sm:py-3 rounded-md transition-colors ${
            isFormValid
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <Loader2
              className="w-5 h-5 animate-spin mx-auto"
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
