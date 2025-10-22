'use client'

import { useState } from 'react'

import useRecords from '@/hooks/running-record/use-records'
import type { CourseOption } from '@/types/running-record/course'
import type { RunningRecord } from '@/types/running-record/record-table-props'

import AddRecordButton from './add-record-button'
import DropDown from './drop-down'
import RecordTable from './record-table'

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
    isLoading,
  } = useRecords(records)

  const [selectedCourse, setSelectedCourse] = useState<'all' | string>('all')

  const filteredRecords =
    selectedCourse === 'all'
      ? recordList
      : recordList.filter(r => r.course_name === selectedCourse)

  return (
    <>
      <DropDown
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
        isLoading={isLoading}
      />
    </>
  )
}
