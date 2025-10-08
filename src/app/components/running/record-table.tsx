import type { Tables } from '@/lib/supabase/database.types'

type RunningRecord = Tables<'running_record'>

interface RecordTableProps {
  records: RunningRecord[]
}

// 러닝 시간 측정
const getRunningDuration = (totalSeconds: string | null): string => {
  if (totalSeconds === null) return '0초'
  const seconds = parseFloat(totalSeconds)
  if (seconds === 0) return '0초'
  if (seconds < 60) return `${seconds}초`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) return `${hours}시간 ${minutes}분`
  return `${minutes}분 ${seconds % 60}초`
}

// 페이스 시간 측정
const getRunningPace = (totalSeconds: string | null): string => {
  if (totalSeconds === null) return ''
  const seconds = parseFloat(totalSeconds)
  if (seconds === 0) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}'${remainingSeconds.toString().padStart(2, '0')}"`
}

export default function RecordTable({ records }: RecordTableProps) {
  // 만약 리스트에 아무것도 기록이 없을 시,
  if (records.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-white text-gray-500">
        표시할 기록이 없습니다.
      </div>
    )
  }

  return (
    <div className="relative bg-[#fff] overflow-hidden outline rounded-md">
      <table className="min-w-full text-left text-[#424242]">
        <thead className=" text-[#202020]">
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
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td className="px-4 py-3">{record.date}</td>
              <td className="px-4 py-3">{record.distance}km</td>
              <td className="px-4 py-3">
                {getRunningDuration(record.duration)}
              </td>
              <td className="px-4 py-3">{getRunningPace(record.pace)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
