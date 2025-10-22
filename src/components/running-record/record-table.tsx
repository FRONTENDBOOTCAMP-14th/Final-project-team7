'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import type { Tables } from '@/lib/supabase/database.types'
import type { RecordTableProps } from '@/types/running-record/record-table-props'

import EditRecordButton from './edit-record-button'
import EditRecordModal from './edit-record-modal'

type RunningRecord = Tables<'running_record'>

interface RecordTableExtendedProps extends RecordTableProps {
  isLoading: boolean
}

export default function RecordTable({
  records,
  onUpdateSuccess,
  onDeleteSuccess,
  isLoading,
}: RecordTableExtendedProps) {
  const [selectedRecord, setSelectedRecord] = useState<RunningRecord | null>(
    null
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-col h-48 bg-white border border-gray-200 rounded-lg shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-gray-600">
        <Loader2 className="w-6 h-6 mb-2 text-blue-600 animate-spin" />
        열심히 달려오는 중...👟
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-gray-500">
        러닝 기록을 추가해주세요
      </div>
    )
  }

  return (
    <>
      <table className="relative hidden md:table min-w-full overflow-hidden bg-white rounded-lg shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-left text-gray-800">
        <caption className="sr-only">러닝 기록 목록</caption>
        <thead className="bg-blue-100 border-b border-blue-200">
          <tr>
            <th scope="col" className="px-4 py-3">
              날짜
            </th>
            <th scope="col" className="px-4 py-3">
              거리
            </th>
            <th scope="col" className="px-4 py-3">
              러닝시간
            </th>
            <th scope="col" className="px-4 py-3">
              페이스
            </th>
            <th scope="col" className="px-4 py-3 sr-only">
              기록 수정
            </th>
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => (
            <tr
              key={record.id}
              className={`transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } border-t border-gray-200`}
            >
              <th scope="row" className="px-4 py-3 font-normal">
                {record.date}
              </th>
              <td className="px-4 py-3">{record.distance} km</td>
              <td className="px-4 py-3">{record.duration}</td>
              <td className="px-4 py-3">{record.pace}</td>
              <td className="flex justify-center items-center px-4 py-3">
                <EditRecordButton
                  record={record}
                  courses={[
                    { id: record.course_id, course_name: record.course_name },
                  ]}
                  onUpdateSuccess={onUpdateSuccess}
                  onDeleteSuccess={onDeleteSuccess}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="block md:hidden space-y-5 bg-white">
        {records.map(record => (
          <li key={record.id}>
            <button
              type="button"
              onClick={() => setSelectedRecord(record)}
              className="w-full p-4 bg-white border border-gray-200 rounded-md  shadow-[0_0_10px_0_rgba(0,0,0,0.25)]  hover:bg-gray-50 text-left transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800 text-sm">
                  {record.course_name}
                </p>
                <p className="text-xs text-gray-500">{record.date}</p>
              </div>

              <div className="mt-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-600">거리:</span>{' '}
                  {record.distance} km
                </p>
                <p>
                  <span className="font-medium text-gray-600">시간:</span>{' '}
                  {record.duration}
                </p>
                <p className="mt-1 font-medium">페이스: {record.pace}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          courses={[
            {
              id: selectedRecord.course_id,
              course_name: selectedRecord.course_name,
            },
          ]}
          onClose={() => setSelectedRecord(null)}
          onUpdateSuccess={onUpdateSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
    </>
  )
}
