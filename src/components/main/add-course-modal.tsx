'use client'

import { CircleArrowLeft, Info, Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import DrawMap from '@/components/main/draw-map'
import { useCourses } from '@/features/main/course-crud/context'
import type { Path } from '@/features/main/map-fetching/types'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

interface AddCourseModalProps {
  onClose: () => void
}

export default function AddCourseModal({ onClose }: AddCourseModalProps) {
  const [courseName, setCourseName] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [path, setPath] = useState<Path>([])
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string>('')

  const { createCourse, refresh } = useCourses()

  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null
    previousOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (firstFieldRef.current) {
      firstFieldRef.current.focus()
    }

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const n = modalRef.current
        if (!n) return
        const focusable = Array.from(
          n.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter(
          el =>
            !el.hasAttribute('disabled') &&
            el.tabIndex !== -1 &&
            !el.getAttribute('aria-hidden')
        )
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || !n.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflowRef.current
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus()
      }
    }
  }, [onClose])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
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
    if (path.length === 0) {
      toast.error('경로를 최소 2점 이상 그려주세요.')
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
        course_map: path,
        user_id: user.id,
      } as unknown as Course)

      if (!createdCourse) {
        toast.error('코스 추가에 실패했습니다.')
        return
      }

      toast.success('코스 추가에 성공했습니다.')
      await refresh()
      onClose()
    } catch (err: unknown) {
      toast.error('코스 추가에 실패했습니다.')
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: unknown }).message)
          : ''
      if (msg.includes('permission') || msg.includes('RLS')) {
        toast.error('권한 문제로 저장 실패: 테이블/스토리지 정책을 확인하세요.')
      } else {
        toast.error('코스 추가에 실패했습니다.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="flex items-center z-50 fixed inset-0 justify-center bg-black/30 backdrop-blur-xs"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white w-[400px] max-h-[80vh] rounded-lg shadow-lg overflow-y-auto"
      >
        <div className="flex items-center p-4">
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            aria-label="뒤로가기"
          >
            <CircleArrowLeft />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div>
            <input
              ref={firstFieldRef}
              type="text"
              placeholder="코스명"
              name="course_name"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              required
              className={tw`
                px-3 py-2 w-full 
                border border-gray-300 rounded-md outline-none
                focus:ring-2
                `}
            />
          </div>
          <div>
            <textarea
              placeholder="코스 설명을 입력해주세요."
              value={courseDesc}
              name="course_description"
              onChange={e => setCourseDesc(e.target.value)}
              className={tw`
                w-full px-3 py-2 border border-gray-200 rounded-md
                text-sm text-gray-700
                outline-none focus:ring-2 resize-none`}
              rows={3}
            />
          </div>

          <input
            type="file"
            name="course_image"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
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
          </button>

          <div className="bg-gray-300 rounded-md text-center text-gray-600">
            {drawingMode ? (
              <DrawMap onSavePath={setPath} />
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

          <button
            type="submit"
            disabled={isSaving}
            className={tw`
              w-full text-white py-2 rounded-md transition cursor-pointer
              ${
                isSaving
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  )
}
