'use client'

import { ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'

import AddRecordButton from '@/components/running-record/add-record-button'
import DropDown from '@/components/running-record/drop-down'
import RecordTable from '@/components/running-record/record-table'
import useRecords from '@/hooks/running-record/use-records'
import type { CourseOption } from '@/types/running-record/course'
import type { RunningRecord } from '@/types/running-record/record-table-props'
import { tw } from '@/utils/tw'

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

  const handleShowAll = () => setSelectedCourse('all')

  return (
    <>
      <DropDown
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
      />

      <div className="flex items-center justify-between py-5">
        {selectedCourse === 'all' ? (
          <h2 className="text-gray-800 text-lg font-semibold select-none">
            전체 보기
          </h2>
        ) : (
          <button
            type="button"
            onClick={handleShowAll}
            className={tw(`
              flex items-center gap-2 px-3 py-2
              bg-white hover:bg-gray-50  
              rounded-lg border border-gray-300
              shadow-sm text-gray-700 text-sm
              transition cursor-pointer
            `)}
          >
            <ChevronLeft size={18} className="text-gray-600" />
            전체 보기
          </button>
        )}

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
