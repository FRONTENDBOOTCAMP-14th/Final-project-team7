'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { EditRecordButton, EditRecordModal } from '@/components/running-record'
import type { Tables } from '@/lib/supabase/database.types'
import type { RecordTableProps } from '@/types/running-record'

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
        러닝 기록이 없습니다...❌
      </div>
    )
  }

  return (
    <>
      <table className="hidden md:table min-w-full relative bg-white overflow-hidden rounded-lg shadow-[0_0_10px_0_rgba(0,0,0,0.25)] text-left text-gray-800">
        <thead className="bg-blue-100 border-b border-blue-200">
          <tr>
            <th className="px-4 py-3">날짜</th>
            <th className="px-4 py-3">거리</th>
            <th className="px-4 py-3">러닝시간</th>
            <th className="px-4 py-3">페이스</th>
            <th className="px-4 py-3 sr-only">기록 수정</th>
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
              <td className="px-4 py-3">{record.date}</td>
              <td className="px-4 py-3">{record.distance} km</td>
              <td className="px-4 py-3">{record.duration}</td>
              <td className="px-4 py-3">{record.pace}</td>
              <td className="px-4 py-3 flex justify-center items-center">
                <EditRecordButton
                  record={record}
                  courses={[{ id: record.id, course_name: record.course_name }]}
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
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-md shadow-[0_0_10px_0_rgba(0,0,0,0.25)] transition hover:bg-gray-50 active:scale-[0.99]"
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
                <p className="font-medium mt-1">페이스: {record.pace}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* 🧩 수정 모달 */}
      {selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          courses={[
            { id: selectedRecord.id, course_name: selectedRecord.course_name },
          ]}
          onClose={() => setSelectedRecord(null)}
          onUpdateSuccess={onUpdateSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
    </>
  )
}
