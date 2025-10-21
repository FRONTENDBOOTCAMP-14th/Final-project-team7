'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/supabase-client'

interface ProfileData {
  user_name: string | null
  bio: string | null
  profile_image_url?: string | null
}

interface ProfileUpdateData {
  user_name: string
  bio: string
  profile_image_url?: string | null
}

export function useProfileEdit() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
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

        if (error) return toast.error('프로필 정보를 불러오는데 실패했습니다.')
        if (!data) return

        setUsername(data.user_name ?? '')
        setBio(data.bio ?? '')

        if (data.profile_image_url) {
          setOldImagePath(data.profile_image_url)
          const { data: publicUrlData } = supabase.storage
            .from('profile_image')
            .getPublicUrl(data.profile_image_url)
          setImageUrl(publicUrlData.publicUrl)
        }
      } catch {
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.')
      }
    }

    fetchProfile()
  }, [router])

  const handleImageChange = (fileOrUrl: File | string | null) => {
    if (!fileOrUrl) return
    if (fileOrUrl instanceof File) {
      setImageFile(fileOrUrl)
      setImageUrl(URL.createObjectURL(fileOrUrl))
    } else {
      setImageUrl(fileOrUrl)
    }
  }

  const handleSave = async () => {
    if (!userId) return toast.error('사용자 정보가 없습니다.')
    setLoading(true)

    try {
      let imageStoragePath = oldImagePath
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}.${fileExt}`
        const filePath = fileName

        if (oldImagePath)
          await supabase.storage.from('profile_image').remove([oldImagePath])
        const { error } = await supabase.storage
          .from('profile_image')
          .upload(filePath, imageFile)
        if (error) throw error

        imageStoragePath = filePath
      }

      const updateData: ProfileUpdateData = { user_name: username, bio }
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
    } catch {
      toast.error('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return {
    username,
    bio,
    imageUrl,
    loading,
    setUsername,
    setBio,
    handleImageChange,
    handleSave,
  }
}
