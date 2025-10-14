'use client'

import { useState } from 'react'

import { AddRecordButton, DropDown, RecordTable } from '../components/index'
import { useRecords } from '../hooks'
import type { CourseOption, RunningRecord } from '../types'

interface CourseRecordProps {
  courses: CourseOption[]
  records: RunningRecord[]
}

// drop-down, record-table 컴포넌트를 묶어놓은 컨테이너
export default function RecordContainer({
  courses,
  records,
}: CourseRecordProps) {
  const {
    records: recordList,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useRecords(records)
  const [selectedCourse, setSelectedCourse] = useState<string | 'all'>('all')

  const filteredRecords =
    selectedCourse === 'all'
      ? recordList
      : recordList.filter(r => r.course_name === selectedCourse)

  return (
    <>
      <DropDown
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseChange={courseName => setSelectedCourse(courseName)}
      />

      <div className="flex py-5 items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedCourse === 'all' ? '전체 보기' : null}
        </h2>
        <AddRecordButton courses={courses} onAddSuccess={addRecord} />
      </div>

      <RecordTable
        records={filteredRecords}
        onUpdateSuccess={updateRecord}
        onDeleteSuccess={deleteRecord}
      />
    </>
  )
}
