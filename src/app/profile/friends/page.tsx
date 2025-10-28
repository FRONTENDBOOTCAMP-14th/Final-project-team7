'use client'

import type { Session } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import AddFriendModal from '@/components/friends/add-friends-modal'
import FriendsList from '@/components/friends/friends-list'
import { supabase } from '@/lib/supabase/supabase-client'
import type {
  FriendListItem,
  FriendRelationRow,
  FriendRequestItem,
} from '@/types/friends/friends'
import { tw } from '@/utils/tw'

export default function FriendsPage() {
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [friends, setFriends] = useState<FriendListItem[]>([])
  const [requests, setRequests] = useState<FriendRequestItem[]>([])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const addButtonRef = useRef<HTMLButtonElement | null>(null)

  async function handleAddSuccess() {
    if (!session) return
    await loadRequestsData(session.user.id)
  }

  async function handleAcceptRequest(relationId: number) {
    if (!session) return

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' as FriendRelationRow['status'] })
      .eq('id', relationId)

    if (error) {
      toast.error('요청 수락에 실패했습니다')
      return
    }

    toast.success('친구 요청이 수락되었습니다')

    setRequests(prev => prev.filter(r => r.relationId !== relationId))
    await loadFriendsData(session.user.id)
  }

  async function handleRejectRequest(relationId: number) {
    if (!session) return

    const { error } = await supabase
      .from('friends')
      .update({ status: 'rejected' as FriendRelationRow['status'] })
      .eq('id', relationId)

    if (error) {
      toast.error('요청 거절에 실패했습니다')
      return
    }

    toast.success('친구 요청을 거절했습니다')

    setRequests(prev => prev.filter(r => r.relationId !== relationId))
  }

  async function loadFriendsData(myUserId: string) {
    const { data: relationRows, error } = await supabase
      .from('friends')
      .select('id, user_id, friend_id, status, created_at')
      .or(`user_id.eq.${myUserId},friend_id.eq.${myUserId}`)
      .eq('status', 'accepted')

    if (error || !relationRows) {
      setFriends([])
      return
    }

    const otherUserIds = relationRows.map(row =>
      row.user_id === myUserId ? row.friend_id : row.user_id
    )

    if (otherUserIds.length === 0) {
      setFriends([])
      return
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_name, bio, signup_date, profile_image_url')
      .in('id', otherUserIds)

    if (profileError || !profiles) {
      setFriends([])
      return
    }

    async function resolveProfileImageUrl(raw: string | null): Promise<string> {
      const profileImageFallback = '/dev_profiles/default_user.png'
      if (!raw) return profileImageFallback
      const trimmed = raw.trim()
      if (!trimmed) return profileImageFallback

      const isDirect =
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('data:')

      if (isDirect) return trimmed

      const { data, error } = await supabase.storage
        .from('profile_image')
        .createSignedUrl(trimmed, 60)

      if (error || !data?.signedUrl) {
        return profileImageFallback
      }

      return data.signedUrl
    }

    const signedProfiles = await Promise.all(
      profiles.map(async p => {
        const signedUrl = await resolveProfileImageUrl(
          p.profile_image_url ?? null
        )
        return {
          id: p.id,
          user_name: p.user_name ?? '이름 없음',
          bio: p.bio ?? '',
          signup_date: p.signup_date ?? null,
          profile_image_url: signedUrl,
        }
      })
    )

    const profileMap = new Map<
      string,
      {
        user_name: string | null
        bio: string | null
        signup_date: string | null
        profile_image_url: string | null
      }
    >()

    signedProfiles.forEach(p => {
      profileMap.set(p.id, {
        user_name: p.user_name ?? null,
        bio: p.bio ?? null,
        signup_date: p.signup_date ?? null,
        profile_image_url: p.profile_image_url ?? null,
      })
    })

    const list: FriendListItem[] = relationRows.map(rel => {
      const otherId = rel.user_id === myUserId ? rel.friend_id : rel.user_id
      const p = profileMap.get(otherId)

      return {
        relationId: rel.id,
        userId: otherId,
        profile: {
          user_name: p?.user_name ?? '이름 없음',
          bio: p?.bio ?? '',
          signup_date: p?.signup_date ?? null,
          profile_image_url:
            p?.profile_image_url ?? '/dev_profiles/default_user.png',
        },
      }
    })

    setFriends(list)
  }

  async function loadRequestsData(myUserId: string) {
    const { data: pendingRows, error } = await supabase
      .from('friends')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', myUserId)
      .eq('status', 'pending')

    if (error || !pendingRows) {
      setRequests([])
      return
    }

    const requesterIds = pendingRows.map(r => r.user_id)

    if (requesterIds.length === 0) {
      setRequests([])
      return
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_name, bio, signup_date, profile_image_url')
      .in('id', requesterIds)

    if (profileError || !profiles) {
      setRequests([])
      return
    }

    async function resolveProfileImageUrl(raw: string | null): Promise<string> {
      const profileImageFallback = '/dev_profiles/default_user.png'
      if (!raw) return profileImageFallback
      const trimmed = raw.trim()
      if (!trimmed) return profileImageFallback

      const isDirect =
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('data:')

      if (isDirect) return trimmed

      const { data, error } = await supabase.storage
        .from('profile_image')
        .createSignedUrl(trimmed, 60)

      if (error || !data?.signedUrl) {
        return profileImageFallback
      }

      return data.signedUrl
    }

    const signedProfiles = await Promise.all(
      profiles.map(async p => {
        const signedUrl = await resolveProfileImageUrl(
          p.profile_image_url ?? null
        )
        return {
          id: p.id,
          user_name: p.user_name ?? '이름 없음',
          bio: p.bio ?? '',
          signup_date: p.signup_date ?? null,
          profile_image_url: signedUrl,
        }
      })
    )

    const profileMap = new Map<
      string,
      {
        user_name: string | null
        bio: string | null
        signup_date: string | null
        profile_image_url: string | null
      }
    >()

    signedProfiles.forEach(p => {
      profileMap.set(p.id, {
        user_name: p.user_name ?? null,
        bio: p.bio ?? null,
        signup_date: p.signup_date ?? null,
        profile_image_url: p.profile_image_url ?? null,
      })
    })

    const list: FriendRequestItem[] = pendingRows.map(rel => {
      const p = profileMap.get(rel.user_id)

      return {
        relationId: rel.id,
        userId: rel.user_id,
        profile: {
          user_name: p?.user_name ?? '이름 없음',
          bio: p?.bio ?? '',
          signup_date: p?.signup_date ?? null,
          profile_image_url:
            p?.profile_image_url ?? '/dev_profiles/default_user.png',
        },
      }
    })

    setRequests(list)
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()
      const current = data.session ?? null
      setSession(current)

      if (!current) {
        setIsLoading(false)
        return
      }

      await Promise.all([
        loadFriendsData(current.user.id),
        loadRequestsData(current.user.id),
      ])

      setIsLoading(false)
    }

    void init()
  }, [])

  if (isLoading) {
    return (
      <div
        className={tw(`
          flex flex-col items-center justify-center
          w-full max-w-[768px] mx-auto px-4
          min-h-[50vh] gap-4
          bg-white text-gray-800
        `)}
        aria-busy="true"
        aria-live="polite"
      >
        <Loader2
          className="w-8 h-8 text-[var(--color-point-100)] animate-spin"
          aria-hidden="true"
        />
        <p className="text-gray-500 text-base font-normal">불러오는 중...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div
        className={tw(`
          flex flex-col
          w-full max-w-[768px] mx-auto p-4 gap-6
          bg-white border border-transparent rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <header
          className={tw(`
            flex items-center
            w-full h-[48px] gap-2
            bg-transparent border-b border-gray-200 rounded-none
            text-gray-800 text-base font-semibold
          `)}
        >
          <h1 className="text-gray-800 text-base font-semibold">친구 관리</h1>
        </header>

        <p className="text-gray-500 text-base font-normal">
          로그인 후 이용할 수 있습니다
        </p>

        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          className={tw(`
            flex items-center justify-center
            w-full h-[48px]
            bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] border border-transparent rounded-lg shadow-[0_0_6px_0_rgba(0,0,0,0.25)]
            text-white text-base
            cursor-pointer 
          `)}
        >
          로그인하러 가기
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        className={tw(`
          flex flex-col
          w-full max-w-[768px] mx-auto p-4 gap-8
          bg-white border border-transparent rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <FriendsList
          friends={friends}
          requests={requests}
          isAddModalOpen={isAddModalOpen}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          addButtonRef={addButtonRef}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onDeleteFriend={async relationId => {
            if (!session) return

            const ok = window.confirm('친구를 삭제하시겠습니까?')
            if (!ok) return

            const { error } = await supabase
              .from('friends')
              .delete()
              .eq('id', relationId)

            if (error) {
              toast.error('친구 삭제에 실패했습니다')
              return
            }

            toast.success('친구가 삭제되었습니다')

            setFriends(prev => prev.filter(f => f.relationId !== relationId))
          }}
        />
      </div>

      {isAddModalOpen && session && (
        <AddFriendModal
          currentUserId={session.user.id}
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={handleAddSuccess}
          anchorRef={addButtonRef}
        />
      )}
    </>
  )
}
