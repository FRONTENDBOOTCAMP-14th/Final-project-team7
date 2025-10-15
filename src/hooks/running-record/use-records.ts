'use client'

import { useCallback, useState } from 'react'

import type { RunningRecord } from '@/types/running-record/record'

export function useRecords(initialRecords: RunningRecord[]) {
  const [records, setRecords] = useState(initialRecords)

  const addRecord = useCallback(
    (newRecord: RunningRecord) => setRecords(prev => [...prev, newRecord]),
    []
  )

  const updateRecord = useCallback(
    (updated: RunningRecord) =>
      setRecords(prev =>
        prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r))
      ),
    []
  )

  const deleteRecord = useCallback(
    (deletedId: string) =>
      setRecords(prev => prev.filter(r => r.id !== deletedId)),
    []
  )

  return { records, addRecord, updateRecord, deleteRecord }
}
