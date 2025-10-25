import RecordContainer from '@/components/running-record/record-container'
import { supabase } from '@/lib/supabase/supabase-client'

export default async function RunningPage() {
  const [{ data: courses }, { data: records }] = await Promise.all([
    supabase.from('course').select('*'),
    supabase.from('running_record').select('*'),
  ])

  return (
    <div className="px-[15px] py-5 min-h-screen">
      <RecordContainer courses={courses ?? []} records={records ?? []} />
    </div>
  )
}
