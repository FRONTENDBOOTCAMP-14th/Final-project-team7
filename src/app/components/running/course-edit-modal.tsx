'use client'

import { useState } from 'react'

import DropDown from '@/app/components/running/drop-down'
import { supabase } from '@/lib/supabase/supabase-client'

interface CourseEditModalProps {
  courses: { id: string; course_name: string }[]
  onClose: () => void
}

export default function CourseEditModal({
  courses,
  onClose,
}: CourseEditModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<'all' | string>('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  const handleUpdate = async () => {
    if (selectedCourse === 'all') {
      alert('코스를 선택해주세요.')
      return
    }

    const { error } = await supabase
      .from('running_record')
      .update({
        distance,
        duration,
        date: selectedDate,
      })
      .eq('course_name', selectedCourse)

    if (error) {
      console.error(error)
      alert('수정 실패')
    } else {
      alert('코스 기록이 수정되었습니다!')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs  z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* 뒤로가기 버튼 */}
        <button onClick={onClose} className="pb-4 text-gray-500 cursor-pointer">
          뒤로가기
        </button>

        {/* 드롭다운 */}
        <div className="mb-4">
          <DropDown
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
          />
        </div>

        {/* 날짜 선택 */}
        <div className="mb-4">
          <label className="text-gray-700 mb-1">날짜 선택</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-400 cursor-pointer"
          />
        </div>

        {/* 거리 / 시간 입력 */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">수정할 값</label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="거리 (km)"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="러닝 시간 (초 단위)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-colors cursor-pointer"
        >
          저장하기
        </button>
      </div>
    </div>
  )
}
