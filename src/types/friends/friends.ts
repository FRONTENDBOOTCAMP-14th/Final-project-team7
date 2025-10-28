import type { ProfileData } from '@/types/profile/profile'

export interface FriendRelationRow {
  id: number
  created_at: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
}

export interface FriendListItem {
  relationId: number
  userId: string
  profile: ProfileData & {
    user_name: string | null
    profile_image_url: string | null
    bio: string | null
  }
}

export type FriendRequestItem = FriendListItem
