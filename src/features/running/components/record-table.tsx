import EditRecordButton from '@/features/running/components/edit-record-button'
import type { Tables } from '@/lib/supabase/database.types'

type RunningRecord = Tables<'running_record'>

interface RecordTableProps {
  records: RunningRecord[]
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}

export default function RecordTable({
  records,
  onUpdateSuccess,
  onDeleteSuccess,
}: RecordTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-white text-gray-500 border border-gray-200 rounded-md shadow-sm">
        표시할 기록이 없습니다.
      </div>
    )
  }

  return (
    <div className="relative bg-white overflow-hidden border border-gray-200 rounded-lg shadow-md">
      <table className="min-w-full text-left text-gray-800">
        <thead className="bg-blue-100 border-b border-blue-200">
          <tr>
            <th className="px-4 py-3">날짜</th>
            <th className="px-4 py-3">거리</th>
            <th className="px-4 py-3">러닝시간</th>
            <th className="px-4 py-3">페이스</th>
            <th className="px-4 py-3"></th>
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
              <td className="px-4 py-3">{record.distance}km</td>
              <td className="px-4 py-3">{record.duration}</td>
              <td className="px-4 py-3">{record.pace}</td>
              <td className="px-4 py-3">
                <div role="button" className="flex justify-end">
                  <EditRecordButton
                    courses={[
                      { id: record.id, course_name: record.course_name },
                    ]}
                    record={record}
                    onUpdateSuccess={onUpdateSuccess}
                    onDeleteSuccess={onDeleteSuccess}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
