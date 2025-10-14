import { supabase } from '@/lib/supabase/supabase-client'

export async function getInitialCourse() {
  const { data } = await supabase
    .from('course')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}
