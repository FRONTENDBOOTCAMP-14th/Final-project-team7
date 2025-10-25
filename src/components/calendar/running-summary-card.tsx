import '@/styles/common/theme.css'

interface RunningSummaryCardProps {
  totalDistance: number
  totalRuns: number
  avgPace: string
}

export default function RunningSummaryCard({
  totalDistance,
  totalRuns,
  avgPace,
}: RunningSummaryCardProps) {
  return (
    <div className="p-5 bg-white rounded-lg shadow-[0_0_6px_0_rgba(0,0,0,0.25)] w-full max-w-[363px]">
      <div className="flex justify-around">
        <div>
          <p className="text-[var(--color-basic-200)] text-sm">총 거리</p>
          <p className="text-lg font-bold text-[var(--color-point-200)]">
            {totalDistance} km
          </p>
        </div>
        <div>
          <p className="text-[var(--color-basic-200)] text-sm">달린 횟수</p>
          <p className="text-lg font-bold text-[var(--color-point-200)]">
            {totalRuns} 회
          </p>
        </div>
        <div>
          <p className="text-[var(--color-basic-200)] text-sm">평균 페이스</p>
          <p className="text-lg font-bold text-[var(--color-point-200)]">
            {avgPace} /km
          </p>
        </div>
      </div>
    </div>
  )
}
