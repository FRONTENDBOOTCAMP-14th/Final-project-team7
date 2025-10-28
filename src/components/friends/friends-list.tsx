'use client'

import { Plus } from 'lucide-react'

import FriendItem from '@/components/friends/friends-item'
import type { FriendListItem, FriendRequestItem } from '@/types/friends/friends'
import { tw } from '@/utils/tw'

interface FriendsListProps {
  friends: FriendListItem[]
  requests: FriendRequestItem[]

  isAddModalOpen: boolean
  onOpenAddModal: () => void
  addButtonRef: React.RefObject<HTMLButtonElement | null>

  onAcceptRequest: (relationId: number) => void
  onRejectRequest: (relationId: number) => void

  onDeleteFriend: (relationId: number) => void
}

export default function FriendsList({
  friends,
  requests,
  isAddModalOpen,
  onOpenAddModal,
  addButtonRef,
  onAcceptRequest,
  onRejectRequest,
  onDeleteFriend,
}: FriendsListProps) {
  return (
    <>
      <section
        className={tw(`
          flex flex-col
          w-full gap-4
          bg-transparent border border-transparent rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <div
          className={tw(`
            flex items-center justify-between
            w-full
            bg-transparent border-gray-200 rounded-none
            text-gray-800 text-base font-semibold
          `)}
        >
          <h2 className="text-gray-800 text-lg font-medium">친구목록</h2>

          <button
            ref={addButtonRef}
            type="button"
            onClick={onOpenAddModal}
            className={tw(`
              flex items-center
              gap-2 px-3 py-2
              bg-white border border-gray-300 rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50
              text-gray-700 text-sm font-normal
              cursor-pointer transition
            `)}
            aria-haspopup="dialog"
            aria-expanded={isAddModalOpen}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            친구추가
          </button>
        </div>

        <p
          className={tw(`
            flex
            w-full p-3
            bg-[#F8F8F8] border border-gray-200 rounded-md
            text-gray-600 text-sm font-normal
          `)}
        >
          친구를 만들어 함께 러닝해요🏃
        </p>

        <ul
          className={tw(`
            flex flex-col
            w-full
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-base font-normal
          `)}
        >
          {friends.length === 0 ? (
            <li
              className={tw(`
                flex items-center
                w-full py-4
                bg-transparent border-gray-200 rounded-none
                text-gray-500 text-sm font-normal
              `)}
            >
              등록된 친구가 없습니다
            </li>
          ) : (
            friends.map(friend => (
              <FriendItem
                key={friend.relationId}
                item={friend}
                variant="friend"
                onDeleteFriend={onDeleteFriend}
              />
            ))
          )}
        </ul>
      </section>

      <section
        className={tw(`
          flex flex-col
          w-full gap-4
          bg-transparent border-t border-gray-300 rounded-none
          text-gray-800 text-base font-normal
        `)}
      >
        <h2
          className={tw(`
            flex items-center
            w-full pt-4
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-lg font-medium
          `)}
        >
          친구요청
        </h2>

        <ul
          className={tw(`
            flex flex-col
            w-full
            bg-transparent border border-transparent rounded-none
            text-gray-800 text-base font-normal
          `)}
        >
          {requests.length === 0 ? (
            <li
              className={tw(`
                flex items-center
                w-full py-4
                bg-transparent border-gray-200 rounded-none
                text-gray-500 text-sm font-normal
              `)}
            >
              현재 받은 친구 요청이 없습니다
            </li>
          ) : (
            requests.map(req => (
              <FriendItem
                key={req.relationId}
                item={req}
                variant="request"
                onAcceptRequest={onAcceptRequest}
                onRejectRequest={onRejectRequest}
              />
            ))
          )}
        </ul>
      </section>
    </>
  )
}
