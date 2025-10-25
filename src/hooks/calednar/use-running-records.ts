import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

export interface RunningRecord {
  id: string
  created_at: string
  course_name: string
  date: string
  distance: string
  duration: string
  pace: string
}

export default function useRunningRecords(currentMonth: Date, userId?: string) {
  const [courses, setCourses] = useState<RunningRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setCourses([])
      return
    }

    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDate = new Date(year, month, 0).getDate()
        const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`

        const { data, error } = await supabase
          .from('running_record')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr)

        if (error) throw error
        setCourses(data ? (data as RunningRecord[]) : [])
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : String(err)
        toast.error(`데이터 불러오기 실패: ${message}`)
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [currentMonth, userId])

  return { courses, isLoading }
}
