// constants/main/sort.ts
export const SORT = {
  LATEST: '최신순',
  OLDEST: '오래된순',
  NAME: '가나다순',
} as const

// 'LATEST' | 'OLDEST' | 'NAME'
export type SortKey = keyof typeof SORT

// 서버 쿼리에서 사용할 정렬 컬럼/방향 매핑
export const SORT_ORDER: Record<
  SortKey,
  { column: string; ascending: boolean }
> = {
  LATEST: { column: 'created_at', ascending: false },
  OLDEST: { column: 'created_at', ascending: true },
  NAME: { column: 'course_name', ascending: true },
}

export const DEFAULT_SORT: SortKey = 'LATEST'
