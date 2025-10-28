'use client'

import Profile from '@/components/common/profile'
import type { FriendListItem, FriendRequestItem } from '@/types/friends/friends'
import { tw } from '@/utils/tw'

interface FriendsItemProps {
  item: FriendListItem | FriendRequestItem
  variant: 'friend' | 'request'
  onAcceptRequest?: (relationId: number) => void
  onRejectRequest?: (relationId: number) => void
  onDeleteFriend?: (relationId: number) => void
}

export default function FriendsItem({
  item,
  variant,
  onAcceptRequest,
  onRejectRequest,
  onDeleteFriend,
}: FriendsItemProps) {
  return (
    <li
      className={tw(`
        flex items-center justify-between
        w-full py-3
        bg-transparent border-gray-200 rounded-none
        text-gray-800 text-base font-normal
      `)}
    >
      <div
        className={tw(`
          flex items-center
          gap-3
          bg-transparent border border-transparent rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <Profile
          src={item.profile.profile_image_url ?? undefined}
          alt={`${item.profile.user_name ?? '사용자'} 프로필 이미지`}
          size={40}
        />

        <div
          className={tw(`
            flex flex-col
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-base font-normal
          `)}
        >
          <span className="text-gray-900 text-base font-semibold">
            {item.profile.user_name ?? '이름 없음'}
          </span>
          <span className="text-gray-500 text-sm font-normal">
            {item.profile.bio ?? '소개가 아직 없어요.'}
          </span>
        </div>
      </div>

      {variant === 'friend' ? (
        <button
          type="button"
          onClick={() => {
            if (onDeleteFriend) {
              onDeleteFriend(item.relationId)
            }
          }}
          className={tw(`
            flex items-center justify-center
            h-[32px] min-w-[48px] px-2
            bg-red-500 border border-transparent rounded-md hover:bg-red-600
            text-white text-sm font-normal
            cursor-pointer
          `)}
          aria-label="친구 삭제"
        >
          삭제
        </button>
      ) : (
        <div
          className={tw(`
            flex items-center
            gap-2
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-base font-normal
          `)}
        >
          <button
            type="button"
            onClick={() => {
              if (onAcceptRequest) {
                onAcceptRequest(item.relationId)
              }
            }}
            className={tw(`
              flex items-center justify-center
              h-[32px] min-w-[48px] px-2
              bg-[var(--color-point-100)] border border-transparent rounded-md hover:bg-[var(--color-point-200)]
              text-white text-sm font-normal
              cursor-pointer
            `)}
          >
            수락
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRejectRequest) {
                onRejectRequest(item.relationId)
              }
            }}
            className={tw(`
              flex items-center justify-center
              h-[32px] min-w-[48px] px-2
              bg-red-500 border border-transparent rounded-md hover:bg-red-600
              text-white text-sm font-normal
              cursor-pointer
            `)}
          >
            거절
          </button>
        </div>
      )}
    </li>
  )
}
