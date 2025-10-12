'use client'

import { useState } from 'react'

import AddRecordButton from '@/features/running/components/add-record-button'
import DropDown from '@/features/running/components/drop-down'
import RecordTable from '@/features/running/components/record-table'
import { useRecords } from '@/features/running/hooks/use-records'
import type { CourseOption } from '@/features/running/types/course'
import type { RunningRecord } from '@/features/running/types/record'

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
