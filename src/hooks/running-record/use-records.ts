'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/supabase-client'
import type { RunningRecord } from '@/types/running-record/record-table-props'

export function useRecords(initialRecords: RunningRecord[]) {
  const [records, setRecords] = useState(initialRecords)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('running_record')
        .select('*')
        .order('date', { ascending: false })

      if (!error && data) {
        setRecords(data)
      }

      setIsLoading(false)
    }

    fetchRecords()
  }, [])

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

  return { records, addRecord, updateRecord, deleteRecord, isLoading }
}
