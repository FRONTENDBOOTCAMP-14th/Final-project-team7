import { RecordClient as CourseRecord } from '@/app/running-record'
import { supabase } from '@/lib/supabase/supabase-client'

export default async function RunningPage() {
  const { data: courses } = await supabase.from('course').select('*')
  const { data: records } = await supabase.from('running_record').select('*')

  return (
    <>
      <CourseRecord courses={courses ?? []} records={records ?? []} />
    </>
  )
}
