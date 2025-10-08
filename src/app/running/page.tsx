import CourseRecord from '@/app/components/running/record-client'
import { supabase } from '@/lib/supabase/supabase-client'

export default async function RunningPage() {
  const { data: courses } = await supabase
    .from('course')
    .select('id, course_name')
  const { data: records } = await supabase.from('running_record').select('*')

  return (
    <div className="bg-gray-50">
      <CourseRecord courses={courses ?? []} records={records ?? []} />
    </div>
  )
}
