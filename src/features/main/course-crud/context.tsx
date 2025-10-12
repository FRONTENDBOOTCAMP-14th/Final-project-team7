'use client'

import type { ReactNode } from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'

import { DEFAULT_SORT, SORT_ORDER, type SortKey } from '@/constants/main/sort'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'

interface State {
  courses: Course[]
  loading: boolean
  error: string | null
  sortKey: SortKey
  setSortKey: (k: SortKey) => void
  refresh: (k?: SortKey) => Promise<void>
}

const CourseContext = createContext<State | null>(null)

export function CourseProvider({
  children,
  initialCourses = [],
}: {
  children: ReactNode
  initialCourses?: Course[]
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, _setSortKey] = useState<SortKey>(DEFAULT_SORT)

  const refresh = useCallback(
    async (k?: SortKey) => {
      const key = k ?? sortKey
      const { column, ascending } = SORT_ORDER[key]

      setLoading(true)
      setError(null)

      let q = supabase.from('course').select('*')
      q = q.order(column, { ascending })

      const { data, error } = await q
      if (error) setError(error.message)
      setCourses(data ?? [])
      setLoading(false)
    },
    [sortKey]
  )

  const setSortKey = useCallback(
    (k: SortKey) => {
      _setSortKey(k)
      void refresh(k)
    },
    [refresh]
  )

  useEffect(() => {
    if (initialCourses.length === 0) {
      void refresh(DEFAULT_SORT)
    } else {
      if (sortKey !== DEFAULT_SORT) void refresh(sortKey)
    }
  }, [initialCourses.length, refresh, sortKey])

  const value: State = { courses, loading, error, sortKey, setSortKey, refresh }
  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  )
}

export function useCourses() {
  const ctx = useContext(CourseContext)
  if (!ctx)
    throw new Error('useCourses는 <CourseProvider> 내부에서만 사용해야 합니다')
  return ctx
}

export function useCourseById(id: string | null | undefined) {
  const { courses, loading, error, refresh } = useCourses()
  const course = useMemo(
    () => (id ? (courses.find(c => c.id === id) ?? null) : null),
    [id, courses]
  )
  return { course, loading, error, refresh }
}
