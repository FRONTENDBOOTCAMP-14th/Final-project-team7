'use client'

import { useMemo, useState } from 'react'

import AddRecordButton from '@/components/running-record/add-record-button'
import DropDown from '@/components/running-record/drop-down'
import RecordTable from '@/components/running-record/record-table'
import useRecords from '@/hooks/running-record/use-records'
import type { CourseOption } from '@/types/running-record/course'
import type { RunningRecord } from '@/types/running-record/record-table-props'

interface RecordContainerProps {
  courses: CourseOption[]
  records: RunningRecord[]
}

export default function RecordContainer({ records }: RecordContainerProps) {
  const {
    records: recordList,
    addRecord,
    updateRecord,
    deleteRecord,
    isLoading,
  } = useRecords(records)

  const [selectedCourse, setSelectedCourse] = useState<'all' | string>('all')

  const filteredRecords = useMemo(() => {
    if (selectedCourse === 'all') return recordList
    return recordList.filter(r => r.course_id === selectedCourse)
  }, [recordList, selectedCourse])

  return (
    <>
      <DropDown
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
      />

      <div className="flex items-center justify-between py-5">
        <h2 className="text-gray-800 text-lg font-semibold">
          {selectedCourse === 'all' ? '전체 보기' : ''}
        </h2>
        <AddRecordButton onAddSuccess={addRecord} />
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
