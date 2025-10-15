'use client'

import { useState } from 'react'

import {
  AddRecordButton,
  DropDown,
  RecordTable,
} from '@/components/running-record/index'
import { useRecords } from '@/hooks/running-record'
import type { CourseOption, RunningRecord } from '@/types/running-record'

interface CourseRecordProps {
  courses: CourseOption[]
  records: RunningRecord[]
}

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
  const [selectedCourse, setSelectedCourse] = useState<'all' | string>('all')

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

      <div className="flex items-center justify-between py-5">
        <h2 className="text-gray-800 text-lg font-semibold">
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
