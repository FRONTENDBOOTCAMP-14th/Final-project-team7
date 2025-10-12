'use client'

import { CircleArrowLeft, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useModalFocusTrap } from '@/features/running/hooks/use-modal-focus-trap'
import type { EditRecordModalProps } from '@/features/running/types/record'
import {
  calculatePace,
  parseDuration,
} from '@/features/running/utils/pace-utils'
import { isValidRecordForm } from '@/features/running/utils/validation-utils'
import { supabase } from '@/lib/supabase/supabase-client'

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

  const isFormValid = isValidRecordForm({
    course: selectedCourse,
    date,
    distance,
    hours,
    minutes,
    seconds,
    pace,
  })

  const handleUpdate = async () => {
    if (!isFormValid) {
      alert('수정 값(날짜, 거리, 시간)을 모두 채워주세요.')
      return
    }

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

    if (error) {
      alert('기록 수정에 실패했습니다.')
    } else {
      onUpdateSuccess(data)
      alert('기록이 수정되었습니다!')
      onClose()
    }
  }

  // 🗑 삭제 처리
  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return

    const { error } = await supabase
      .from('running_record')
      .delete()
      .eq('id', record.id)

    if (error) {
      alert('삭제 실패')
    } else {
      alert('기록이 삭제되었습니다.')
      onDeleteSuccess(record.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-2 cursor-pointer rounded transition hover:bg-gray-200"
          >
            <CircleArrowLeft size={30} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="삭제하기"
            className="text-red-500 p-2 cursor-pointer rounded transition hover:bg-gray-200"
          >
            <Trash2 size={30} aria-hidden="true" />
          </button>
        </div>

        {/* 코스 선택 */}
        <DropDown
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
        />

        {/* 날짜 */}
        <div className="mt-3">
          <label className="text-gray-700 mb-1">날짜 선택</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 cursor-pointer"
          />
        </div>

        {/* 거리 */}
        <div className="mt-3">
          <InputTimeWithLabel
            label="km"
            value={distance}
            onChange={setDistance}
            placeholder="거리"
            type="number"
          />
        </div>

        {/* 시간 입력 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
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

        {/* 페이스 표시 */}
        <div className="mt-4 text-center text-gray-700">
          <p className="text-sm">km 페이스</p>
          <p className="text-lg font-semibold text-green-600">
            {pace || '--:-- / km'}
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleUpdate}
          disabled={!isFormValid}
          className={`w-full mt-5 py-2 rounded-md transition-colors ${
            isFormValid
              ? 'bg-blue-500 cursor-pointer text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          저장하기
        </button>
      </div>
    </div>
  )
}
