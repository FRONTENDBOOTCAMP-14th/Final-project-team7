'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import RunningCalendar from '@/components/calendar/running-calendar'
import RunningSummaryCard from '@/components/calendar/running-summary-card'
import useRunningRecords from '@/hooks/calednar/use-running-records'
import { supabase } from '@/lib/supabase/supabase-client'
import { paceToSeconds, secondsToPace } from '@/utils/calendar/calendar-record'
import { tw } from '@/utils/tw'

export default function CalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id)
    }
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const { courses, isLoading } = useRunningRecords(currentMonth, userId)
  const [summary, setSummary] = useState({
    totalDistance: 0,
    totalRuns: 0,
    avgPace: '0:00',
  })

  useEffect(() => {
    let totalDistance = 0
    let weightedSecondsSum = 0

    courses.forEach(c => {
      const distance = parseFloat((c.distance ?? '0').trim())
      const paceSeconds = paceToSeconds(c.pace ?? '')
      if (distance > 0 && paceSeconds > 0) {
        totalDistance += distance
        weightedSecondsSum += paceSeconds * distance
      }
    })

    const avgPace =
      totalDistance > 0
        ? secondsToPace(Math.round(weightedSecondsSum / totalDistance))
        : '0:00'

    setSummary({
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalRuns: courses.length,
      avgPace,
    })
  }, [courses])

  if (isLoading) {
    return (
      <div
        className={tw(`
          flex flex-col items-center justify-center
          w-full max-w-[768px] mx-auto p-4
          min-h-[50vh] gap-4
          bg-white text-gray-800
        `)}
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
          aria-hidden="true"
        />
        <p className="text-gray-500 text-base font-normal">
          열심히 달려오는 중...👟
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="w-full text-lg text-left">날짜별 모아보기</h2>

      <RunningCalendar
        courses={courses}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      <h2 className="w-full text-lg text-left">이번달 러닝 요약</h2>

      <RunningSummaryCard
        totalDistance={summary.totalDistance}
        totalRuns={summary.totalRuns}
        avgPace={summary.avgPace}
      />
    </div>
  )
}
