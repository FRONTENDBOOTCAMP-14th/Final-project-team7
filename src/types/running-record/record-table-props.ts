import type { Tables } from '@/lib/supabase/database.types'
import type { CourseOption } from '@/types/running-record/course'

export type RunningRecord = Tables<'running_record'>

export interface RecordTableProps {
  records: RunningRecord[]
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}

export interface AddRecordModalProps {
  courses: CourseOption[]
  onClose: () => void
  onAddSuccess: (newRecord: RunningRecord) => void
}

export interface EditRecordModalProps {
  courses: CourseOption[]
  record: RunningRecord
  onClose: () => void
  onUpdateSuccess: (updated: RunningRecord) => void
  onDeleteSuccess: (deletedId: string) => void
}
