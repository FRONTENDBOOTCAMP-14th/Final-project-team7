'use client'

import { CircleArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import InputWithLabel from '@/features/running/components/common/input-time-with-label'
import { useModalFocusTrap } from '@/features/running/hooks/use-modal-focus-trap'
import type { AddRecordModalProps } from '@/features/running/types/record'
import { calculatePace } from '@/features/running/utils/pace-utils'
import { isValidRecordForm } from '@/features/running/utils/validation-utils'
import { supabase } from '@/lib/supabase/supabase-client'

import DropDown from './drop-down'

export default function AddRecordModal({
  courses,
  onClose,
  onAddSuccess,
}: AddRecordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

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

  const isFormValid = isValidRecordForm({
    course: selectedCourse,
    date,
    distance,
    hours,
    minutes,
    seconds,
    pace,
  })

  const handleSave = async () => {
    if (!isFormValid) {
      alert('모든 입력 값을 채워주세요.')
      return
    }

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

    if (error) {
      alert('기록 추가에 실패했습니다.')
    } else {
      onAddSuccess(data)
      alert('기록이 추가되었습니다!')
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="p-2 cursor-pointer rounded transition hover:bg-gray-200"
          >
            <CircleArrowLeft size={30} aria-hidden="true" />
          </button>
        </div>

        {/* 코스 선택 */}
        <DropDown
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
        />

        {/* 날짜 입력 */}
        <div className="mt-3">
          <label className="text-gray-700">날짜 선택</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 cursor-pointer"
          />
        </div>

        {/* 거리 입력 */}
        <div className="mt-3">
          <label className="block text-gray-700">러닝 거리 (km)</label>
          <InputWithLabel
            label="km"
            value={distance}
            onChange={setDistance}
            placeholder="거리를 입력해주세요"
          />
        </div>

        {/* 시간 입력 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <InputWithLabel
            label="시간"
            value={hours}
            onChange={setHours}
            placeholder="0"
          />
          <InputWithLabel
            label="분"
            value={minutes}
            onChange={setMinutes}
            placeholder="0"
          />
          <InputWithLabel
            label="초"
            value={seconds}
            onChange={setSeconds}
            placeholder="0"
          />
        </div>

        {/* 페이스 표시 */}
        <div className="mt-4 text-center text-gray-700">
          <p className="text-sm">km 페이스</p>
          <p className="text-lg font-semibold text-green-600">
            {pace ?? '--:-- / km'}
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`w-full mt-5 py-2 rounded-md transition-colors ${
            isFormValid
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          추가하기
        </button>
      </div>
    </div>
  )
}
