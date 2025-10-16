import type { Tables } from '@/lib/supabase/database.types'

export type RunningRecord = Tables<'running_record'>

export interface RecordTableProps {
  records: RunningRecord[]
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}

export interface AddRecordModalProps {
  courses: { id: string; course_name: string }[]
  onClose: () => void
  onAddSuccess: (newRecord: RunningRecord) => void
}

export interface EditRecordModalProps {
  courses: { id: string; course_name: string }[]
  record: RunningRecord
  onClose: () => void
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}
