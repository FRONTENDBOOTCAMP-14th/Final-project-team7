'use client'

import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { DEFAULT_SORT, SORT_ORDER, type SortKey } from '@/constants/main/sort'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'

function sortByKey(list: Course[], key: SortKey) {
  const { column, ascending } = SORT_ORDER[key] as {
    column: keyof Course
    ascending: boolean
  }

  type Comp = string | number | boolean | Date | null | undefined

  const toComp = (v: unknown): Exclude<Comp, null | undefined> => {
    if (v instanceof Date) return v
    return v as string | number | boolean
  }

  return [...list].sort((a, b) => {
    const av = a[column] as Comp
    const bv = b[column] as Comp
    if (av === bv) return 0
    if (av == null) return ascending ? 1 : -1
    if (bv == null) return ascending ? -1 : 1

    const A = toComp(av)
    const B = toComp(bv)

    const aNum = A instanceof Date ? A.getTime() : A
    const bNum = B instanceof Date ? B.getTime() : B

    return ascending ? (aNum > bNum ? 1 : -1) : aNum > bNum ? -1 : 1
  })
}

interface State {
  courses: Course[]
  loading: boolean
  error: string | null

  sortKey: SortKey
  setSortKey: (k: SortKey) => void

  refresh: (k?: SortKey) => Promise<void>

  createCourse: (
    payload: Omit<Course, 'id' | 'created_at'>
  ) => Promise<Course | null>
  updateCourse: (id: string, patch: Partial<Course>) => Promise<Course | null>
  removeCourse: (id: string) => Promise<boolean>

  getById: (id: string | null | undefined) => Course | null

  busyIds: Set<string>
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

  const busyIdsRef = useRef<Set<string>>(new Set())
  const [busyIdsVersion, setBusyIdsVersion] = useState(0) // Set 변경 트리거 용

  const bumpBusy = (id: string) => {
    busyIdsRef.current.add(id)
    setBusyIdsVersion(v => v + 1)
  }
  const dropBusy = (id: string) => {
    busyIdsRef.current.delete(id)
    setBusyIdsVersion(v => v + 1)
  }

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

  const createCourse = useCallback(
    async (payload: Omit<Course, 'id' | 'created_at'>) => {
      setError(null)

      const { data, error } = await supabase
        .from('course')
        .insert(payload)
        .select('*')
        .single()

      if (error || !data) {
        setError(error?.message ?? '생성 실패')
        return null
      }

      setCourses(prev => sortByKey([...prev, data], sortKey))
      return data as Course
    },
    [sortKey]
  )

  const updateCourse = useCallback(
    async (id: string, patch: Partial<Course>) => {
      setError(null)

      let prevCourse: Course | null = null
      setCourses(prev => {
        const idx = prev.findIndex(c => c.id === id)
        if (idx < 0) return prev
        prevCourse = { ...prev[idx] }
        const next = [...prev]
        next[idx] = { ...next[idx], ...patch }
        return next
      })
      bumpBusy(id)

      // 서버 반영
      const { data, error } = await supabase
        .from('course')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        // 롤백
        setCourses(prev => {
          if (!prevCourse) return prev
          const idx = prev.findIndex(c => c.id === id)
          if (idx < 0) return prev
          const next = [...prev]
          next[idx] = prevCourse
          return next
        })
        setError(error.message)
        dropBusy(id)
        return null
      }

      // 서버 값으로 동기화 + 정렬 보정
      setCourses(prev => {
        if (!data) return prev
        const idx = prev.findIndex(c => c.id === id)
        if (idx < 0) return prev
        const next = [...prev]
        next[idx] = data as Course
        return next
      })
      setCourses(prev => sortByKey(prev, sortKey))
      dropBusy(id)
      return (data ?? null) as Course | null
    },
    [sortKey]
  )

  const removeCourse = useCallback(
    async (id: string) => {
      setError(null)

      let removed: Course | null = null
      setCourses(prev => {
        const idx = prev.findIndex(c => c.id === id)
        if (idx < 0) return prev
        const next = [...prev]
        removed = next.splice(idx, 1)[0] ?? null
        return next
      })
      bumpBusy(id)

      const { error } = await supabase.from('course').delete().eq('id', id)

      if (error) {
        // 복원
        setCourses(prev => (removed ? [...prev, removed] : prev))
        setCourses(prev => sortByKey(prev, sortKey))
        setError(error.message)
        dropBusy(id)
        return false
      }

      dropBusy(id)
      return true
    },
    [sortKey]
  )

  useEffect(() => {
    if (initialCourses.length === 0) {
      void refresh(DEFAULT_SORT)
    } else {
      if (sortKey !== DEFAULT_SORT) void refresh(sortKey)
    }
  }, [initialCourses.length, refresh, sortKey])

  const getById = useCallback(
    (id: string | null | undefined) =>
      id ? (courses.find(c => c.id === id) ?? null) : null,
    [courses]
  )

  const value: State = {
    courses,
    loading,
    error,

    sortKey,
    setSortKey,
    refresh,

    createCourse,
    updateCourse,
    removeCourse,

    getById,
    busyIds: new Set(busyIdsRef.current), // 버전 키로 재생성되어 변화 반영
  }

  const _ = busyIdsVersion

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
