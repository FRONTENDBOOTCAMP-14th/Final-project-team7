'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import BioInput from '@/components/profile-edit/bio-input'
import ProfileEdit from '@/components/profile-edit/profile-edit'
import SaveButton from '@/components/profile-edit/save-button'
import UsernameInput from '@/components/profile-edit/username-input'
import { supabase } from '@/lib/supabase/supabase-client'

import '@/styles/main.css'

interface ProfileData {
  user_name: string | null
  bio: string | null
  signup_date?: string | null
  profile_image_url?: string | null
}

export default function ProfileEditClient() {
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [oldImagePath, setOldImagePath] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error('로그인이 필요합니다.')
          router.push('/sign-in')
          return
        }

        setUserId(user.id)

        const { data, error } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()) as { data: ProfileData | null; error: unknown }

        if (error) {
          toast.error('프로필 정보를 불러오는데 실패했습니다.')
          return
        }

        if (data) {
          setUsername(data.user_name ?? '')
          setBio(data.bio ?? '')
          if (data.profile_image_url) {
            setOldImagePath(data.profile_image_url)
            const { data: publicUrlData } = supabase.storage
              .from('profile_image')
              .getPublicUrl(data.profile_image_url)
            setProfileImageUrl(publicUrlData.publicUrl)
          }
        }
      } catch (_err) {
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.')
      }
    }

    fetchProfile()
  }, [router])

  const handleImageChange = (imageData: File | string | null) => {
    if (!imageData) return
    if (imageData instanceof File) {
      setProfileImageFile(imageData)
      setProfileImageUrl(URL.createObjectURL(imageData))
    } else if (typeof imageData === 'string') {
      setProfileImageUrl(imageData)
    }
  }

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!userId) return null
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = fileName

      if (oldImagePath) {
        await supabase.storage.from('profile_image').remove([oldImagePath])
      }

      const { error } = await supabase.storage
        .from('profile_image')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (error) throw error
      return filePath
    } catch (_err) {
      toast.error('이미지 업로드에 실패했습니다.')
      return null
    }
  }

  const handleSave = async () => {
    if (!userId) {
      toast.error('사용자 정보가 없습니다.')
      return
    }

    setLoading(true)
    try {
      let imageStoragePath = oldImagePath
      if (profileImageFile) {
        const uploadedPath = await uploadProfileImage(profileImageFile)
        if (!uploadedPath) {
          setLoading(false)
          return
        }
        imageStoragePath = uploadedPath
      }

      const updateData: {
        user_name: string
        bio: string
        profile_image_url?: string
      } = {
        user_name: username,
        bio,
      }
      if (imageStoragePath) updateData.profile_image_url = imageStoragePath

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
      if (error) throw error

      toast.success('프로필이 저장되었습니다!')
      setTimeout(() => {
        router.push('/profile')
        router.refresh()
      }, 1000)
    } catch (_err) {
      toast.error('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="flex flex-col w-full justify-center p-4 gap-5 items-center"
      onSubmit={e => {
        e.preventDefault()
        handleSave()
      }}
    >
      <ProfileEdit
        imageUrl={profileImageUrl}
        onChangeImage={handleImageChange}
      />
      <UsernameInput value={username} onChange={setUsername} />
      <BioInput value={bio} onChange={setBio} />
      <SaveButton type="submit" loading={loading} />
    </form>
  )
}
