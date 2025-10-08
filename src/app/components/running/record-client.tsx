'use client'

import { useState } from 'react'

import EditButton from '@/app/components/running/course-edit-button'
import CourseEditModal from '@/app/components/running/course-edit-modal'
import DropDown from '@/app/components/running/drop-down'
import RecordTable from '@/app/components/running/record-table'
import type { Tables } from '@/lib/supabase/database.types'

type Course = Tables<'course'>
type RunningRecord = Tables<'running_record'>

interface CourseRecordProps {
  courses: Course[]
  records: RunningRecord[]
}

export default function CourseRecord({ courses, records }: CourseRecordProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 코스 선택 필터링
  const filteredRecords =
    selectedCourse === 'all'
      ? records
      : records.filter((record) => record.course_name === selectedCourse)

  return (
    <div className="space-y-6 relative">
      {/* 드롭다운 */}
      <DropDown
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseChange={(courseName) => setSelectedCourse(courseName)}
      />

      <div className="flex py-5 items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedCourse === 'all' ? '전체 보기' : null}
        </h2>
        <EditButton onClick={() => setIsModalOpen(true)} />
      </div>

      {/* 기록 테이블 */}
      <RecordTable records={filteredRecords} />

      {isModalOpen && (
        <CourseEditModal
          courses={courses}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
