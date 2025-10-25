import { supabase } from '@/lib/supabase/supabase-client'
import type { MusicLink } from '@/types/running-music/spotify'

export async function getMusicList(userId: string): Promise<MusicLink[]> {
  const { data, error } = await supabase
    .from('music_links')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error('러닝곡 목록 불러오기 실패')
  return data ?? []
}

export async function getMusicStatus(
  userId: string
): Promise<MusicLink | null> {
  const { data, error } = await supabase
    .from('music_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_pinned', true)
    .maybeSingle()

  if (error) throw new Error('대표 러닝곡 불러오기 실패')
  return data ?? null
}

export async function createMusic(
  userId: string,
  music: Omit<MusicLink, 'id' | 'user_id'>
): Promise<MusicLink> {
  const { data, error } = await supabase
    .from('music_links')
    .insert({ ...music, user_id: userId })
    .select()
    .single()

  if (error) throw new Error('러닝곡 추가 실패')
  return data
}

export async function removeMusic(musicId: string): Promise<void> {
  const { error } = await supabase
    .from('music_links')
    .delete()
    .eq('id', musicId)
  if (error) throw new Error('러닝곡 삭제 실패')
}

export async function togglePinnedMusic(
  userId: string,
  musicId: string
): Promise<MusicLink> {
  const { data: currentPinned } = await supabase
    .from('music_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_pinned', true)
    .maybeSingle()

  if (currentPinned?.id === musicId) {
    const { data, error } = await supabase
      .from('music_links')
      .update({ is_pinned: false })
      .eq('id', musicId)
      .select()
      .single()

    if (error) throw new Error('대표 러닝곡 해제 실패')
    return data
  }

  await supabase
    .from('music_links')
    .update({ is_pinned: false })
    .eq('user_id', userId)

  const { data, error } = await supabase
    .from('music_links')
    .update({ is_pinned: true })
    .eq('id', musicId)
    .select()
    .single()

  if (error) throw new Error('대표 러닝곡 설정 실패')
  return data
}
