'use client'

import { CircleArrowLeft, Info, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCourses } from '@/features/main/course-crud/context'
import type { Path } from '@/features/main/map-fetching/types'
import type { Course } from '@/lib/supabase'
import { tw } from '@/utils/tw'

import { supabase } from '../../lib/supabase/supabase-client'

import DrawMap from './draw-map'

interface AddCourseModalProps {
  onClose: () => void
}

export default function AddCourseModal({ onClose }: AddCourseModalProps) {
  const [courseName, setCourseName] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [paths, setPaths] = useState<Path[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createCourse, refresh } = useCourses()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!courseName.trim()) {
      toast.error('코스명을 입력해주세요.')
      return
    }
    if (paths.length === 0) {
      toast.error('경로를 최소 1개 이상 그려주세요.')
      return
    }

    setIsSaving(true)
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) {
        toast.error('로그인이 필요합니다.')
        return
      }

      const sanitizedPaths = paths.map(p => ({
        lat: Number((p as any).lat),
        lng: Number((p as any).lng),
      }))

      let imageUrl: string | null = null
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) {
          toast.error('이미지 파일만 업로드 가능합니다.')
          return
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error('이미지 용량은 최대 5MB까지 허용됩니다.')
          return
        }

        const bucket = 'course_image'
        const filename = `${crypto.randomUUID()}-${imageFile.name}`
        const uploadPath = `courses/${user.id}/${filename}`

        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(uploadPath, imageFile, { upsert: false })
        if (uploadErr) throw uploadErr

        const { data: pub } = await supabase.storage
          .from('course_image')
          .getPublicUrl(uploadPath)
        imageUrl = pub.publicUrl
      }

      const createdCourse = await createCourse({
        course_name: courseName,
        course_desc: courseDesc,
        image: imageUrl,
        course_map: sanitizedPaths,
        user_id: user.id,
      } as unknown as Course)

      if (!createdCourse) {
        toast.error('코스 추가 실패')
        return
      }

      toast.success('코스 추가 성공')
      await refresh()
      onClose()
    } catch (err: any) {
      console.error('ADD_COURSE_FAILED', {
        message: err?.message,
        status: err?.status,
        err,
      })
      const msg = String(err?.message ?? '')
      if (msg.includes('permission') || msg.includes('RLS')) {
        toast.error('권한 문제로 저장 실패: 테이블/스토리지 정책을 확인하세요.')
      } else {
        toast.error('코스 추가 실패')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
      <div className="bg-white w-[400px] rounded-lg shadow-lg overflow-scroll">
        {/* 상단 헤더 */}
        <div className="flex items-center p-4">
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="뒤로가기"
          >
            <CircleArrowLeft />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* 코스명 */}
          <div>
            <input
              type="text"
              placeholder="코스명"
              name="course_name"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              required
              className={tw`
                w-full border border-gray-300 rounded-md px-3 py-2 outline-none
                focus:ring-2 focus:ring-blue-400
                `}
            />
          </div>

          {/* 코스 설명 */}
          <div>
            <textarea
              placeholder="코스 설명을 입력해주세요."
              value={courseDesc}
              name="course_description"
              onChange={e => setCourseDesc(e.target.value)}
              className={tw`
                w-full border border-gray-200 rounded-md px-3 py-2
                text-sm text-gray-700
                outline-none focus:ring-2 focus:ring-blue-400 resize-none`}
              rows={3}
            />
          </div>

          {/* 사진 업로드 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className={tw`
              flex flex-col items-center justify-center
              border-2 border-dashed border-gray-300 rounded-md py-2
              text-gray-500
              cursor-pointer hover:bg-gray-50 transition`}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="코스 이미지 미리보기"
                width={100}
                height={50}
                className="rounded-md object-contain"
              />
            ) : (
              <>
                <Upload className="size-10" />
                <p className="text-sm">사진 업로드</p>
              </>
            )}
            <input
              type="file"
              name="course_image"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 경로 그리기 */}
          <div className="bg-gray-300 rounded-md text-center text-gray-600">
            <input
              type="hidden"
              name="course_map"
              value={JSON.stringify(paths)}
              readOnly
            />
            {drawingMode ? (
              <DrawMap onSavePaths={setPaths} />
            ) : (
              <button
                type="button"
                className="cursor-pointer py-6"
                onClick={() => setDrawingMode(true)}
              >
                경로 추가하기
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Info />
            <p className="text-gray-500 text-[14px] ">
              지점을 클릭해 경로를 그리고, '경로 저장' 버튼을 누르면
              경로데이터가 저장됩니다.
            </p>
          </div>

          {/* 저장하기 버튼 */}
          <button
            type="submit"
            disabled={isSaving}
            className={tw`
              w-full text-white py-2 rounded-md transition cursor-pointer
              ${isSaving ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  )
}
