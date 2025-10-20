'use client'

import { produce } from 'immer'
import type { ReactNode } from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'

import { DEFAULT_SORT, SORT_ORDER, type SortKey } from '@/constants/main/sort'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'

function sortByKey(list: Course[], key: SortKey) {
  const { column, ascending } = SORT_ORDER[key]
  return [...list].sort((a: any, b: any) => {
    const av = a[column]
    const bv = b[column]
    if (av === bv) return 0
    if (av == null) return ascending ? 1 : -1
    if (bv == null) return ascending ? -1 : 1
    return ascending ? (av > bv ? 1 : -1) : av > bv ? -1 : 1
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

      // 서버 생성
      const { data, error } = await supabase
        .from('course')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        setError(error.message)
        return null
      }

      // 성공 시 목록에 추가 + 정렬
      setCourses(prev => sortByKey([...prev, data!], sortKey))
      return data as Course
    },
    [sortKey]
  )

  const updateCourse = useCallback(
    async (id: string, patch: Partial<Course>) => {
      setError(null)

      // 기존 스냅샷
      let prevCourse: Course | null = null
      setCourses(prev =>
        produce(prev, draft => {
          const idx = draft.findIndex(c => c.id === id)
          if (idx >= 0) {
            prevCourse = { ...draft[idx] }
            draft[idx] = { ...draft[idx], ...patch }
          }
        })
      )
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
        setCourses(prev =>
          produce(prev, draft => {
            const idx = draft.findIndex(c => c.id === id)
            if (idx >= 0 && prevCourse) draft[idx] = prevCourse
          })
        )
        setError(error.message)
        dropBusy(id)
        return null
      }

      // 서버 값으로 동기화 + 정렬 보정
      setCourses(prev =>
        produce(prev, draft => {
          const idx = draft.findIndex(c => c.id === id)
          if (idx >= 0) draft[idx] = data as Course
        })
      )
      setCourses(prev => sortByKey(prev, sortKey))
      dropBusy(id)
      return data as Course
    },
    [sortKey]
  )

  const removeCourse = useCallback(
    async (id: string) => {
      setError(null)

      let removed: Course | null = null
      setCourses(prev =>
        produce(prev, draft => {
          const idx = draft.findIndex(c => c.id === id)
          if (idx >= 0) removed = draft.splice(idx, 1)[0] ?? null
        })
      )
      bumpBusy(id)

      const { error } = await supabase.from('course').delete().eq('id', id)

      if (error) {
        // 복원
        setCourses(prev =>
          produce(prev, draft => {
            if (removed) draft.push(removed)
          })
        )
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
