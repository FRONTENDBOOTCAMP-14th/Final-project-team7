import { revalidatePath } from 'next/cache'

import { supabase } from '@/lib/supabase/supabase-client'

export async function createCourseAction(formData: FormData) {
  const name = String(formData.get('course_name') ?? '').trim()
  const description = String(formData.get('course_description') ?? '').trim()
  const path = String(formData.get('course_path') ?? '[]')
  const image_url = String(formData.get('course_image') ?? '')

  if (!name) throw new Error('코스명을 입력해주세요.')

  const { error } = await supabase.from('courses').insert({
    name,
    description,
    path,
    image_url,
  })

  if (error) {
    throw new Error('DB insert 실패')
  }

  revalidatePath('/main')
}
