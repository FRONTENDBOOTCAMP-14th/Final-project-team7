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
        flex items-start justify-between
        w-full py-3
        bg-transparent border-gray-200 rounded-none
        text-gray-800 text-base font-normal
        gap-3
      `)}
    >
      <div
        className={tw(`
          flex items-start gap-3
          flex-1 min-w-0
          bg-transparent border border-transparent rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <div className="flex-shrink-0">
          <Profile
            src={item.profile.profile_image_url ?? undefined}
            alt={`${item.profile.user_name ?? '사용자'} 프로필 이미지`}
            size={40}
          />
        </div>

        <div
          className={tw(`
            flex flex-col
            flex-1 min-w-0
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-base font-normal
          `)}
        >
          <span className="text-gray-900 text-base font-semibold leading-tight break-words">
            {item.profile.user_name ?? '이름 없음'}
          </span>

          <span
            className={tw(`
              text-gray-500 text-sm font-normal
              whitespace-normal break-words
            `)}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
            title={
              item.profile.bio && item.profile.bio.trim() !== ''
                ? item.profile.bio
                : '소개 없음'
            }
          >
            {item.profile.bio && item.profile.bio.trim() !== ''
              ? item.profile.bio
              : '소개 없음'}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
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
              bg-red-500 hover:bg-red-600 border border-transparent rounded-md
              text-white text-sm font-normal
              cursor-pointer
            `)}
            aria-label="친구 삭제"
          >
            삭제
          </button>
        ) : (
          <>
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
                bg-[var(--color-point-100)] hover:bg-[var(--color-point-200)] border border-transparent rounded-md
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
                bg-red-500 hover:bg-red-600 border border-transparent rounded-md
                text-white text-sm font-normal
                cursor-pointer
              `)}
            >
              거절
            </button>
          </>
        )}
      </div>
    </li>
  )
}
