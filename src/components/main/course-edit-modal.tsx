'use client'

import { CircleArrowLeft, Info, Upload } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import DrawMap from '@/components/main/draw-map'
import KakaoMap from '@/components/main/kakao-map'
import { useCourseById, useCourses } from '@/features/main/course-crud/context'
import type { LatLng, Path } from '@/features/main/map-fetching/types'
import type { Course } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/supabase-client'
import { tw } from '@/utils/tw'

interface EditCourseModalProps {
  courseId: string
  onClose: () => void
}

interface Point {
  x: number
  y: number
}

export default function EditCourseModal({
  courseId,
  onClose,
}: EditCourseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { updateCourse, refresh } = useCourses()
  const { course, loading, error } = useCourseById(courseId)

  const [courseName, setCourseName] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [path, setPath] = useState<Path>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isObject = useCallback((u: unknown): u is Record<string, unknown> => {
    return typeof u === 'object' && u !== null
  }, [])

  const isLatLng = useCallback(
    (u: unknown): u is LatLng => {
      if (!isObject(u)) return false
      const o = u
      return typeof o.lat === 'number' && typeof o.lng === 'number'
    },
    [isObject]
  )

  const isLatLngArray = useCallback(
    (u: unknown): u is LatLng[] => {
      return Array.isArray(u) && u.every(isLatLng)
    },
    [isLatLng]
  )

  const isNestedLatLngArray = useCallback(
    (u: unknown): u is LatLng[][] => {
      return (
        Array.isArray(u) &&
        u.length > 0 &&
        u.every(row => Array.isArray(row) && row.every(isLatLng))
      )
    },
    [isLatLng]
  )

  const isPoint = useCallback(
    (u: unknown): u is Point => {
      if (!isObject(u)) return false
      const o = u
      return typeof o.x === 'number' && typeof o.y === 'number'
    },
    [isObject]
  )

  const isPointArray = useCallback(
    (u: unknown): u is Point[] => {
      return Array.isArray(u) && u.every(isPoint)
    },
    [isPoint]
  )

  const toPath = useCallback(
    (input: unknown): Path => {
      if (!input) return []

      if (isLatLngArray(input)) return input
      if (isNestedLatLngArray(input)) return input.flat()
      if (isPointArray(input)) return input.map(p => ({ lat: p.y, lng: p.x }))

      return []
    },
    [isLatLngArray, isNestedLatLngArray, isPointArray]
  )

  useEffect(() => {
    if (!course) return
    setCourseName(course.course_name ?? '')
    setCourseDesc(course.course_desc ?? '')
    setImagePreview(course.image ?? null)
    setPath(toPath(course.course_map))
  }, [course, toPath])

  const hasChanges = useMemo(() => {
    if (!course) return false
    const sameName = (course.course_name ?? '') === courseName
    const sameDesc = (course.course_desc ?? '') === courseDesc
    const sameImg =
      (course.image ?? null) === (imagePreview ?? null) && imageFile === null
    const prev = toPath(course.course_map)
    const samePath =
      prev.length === path.length &&
      prev.every((p, i) => p.lat === path[i]?.lat && p.lng === path[i]?.lng)
    return !(sameName && sameDesc && sameImg && samePath)
  }, [course, courseName, courseDesc, imagePreview, imageFile, toPath, path])

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(String(reader.result ?? ''))
    reader.readAsDataURL(f)
  }

  function handleDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setImageFile(f)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(String(reader.result ?? ''))
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!course) return
    if (!courseName.trim()) {
      toast.error('코스명을 입력해주세요.')
      return
    }
    if (path.length < 2) {
      toast.error('경로를 최소 2점 이상 입력해주세요.')
      return
    }
    if (!hasChanges) {
      toast.info('변경된 내용이 없습니다.')
      return
    }

    setIsSaving(true)
    try {
      let nextImageUrl: string | null | undefined = imagePreview ?? null
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) {
          toast.error('이미지 파일만 업로드 가능합니다.')
          setIsSaving(false)
          return
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error('이미지 용량은 최대 5MB까지 허용됩니다.')
          setIsSaving(false)
          return
        }

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) {
          toast.error('로그인이 필요합니다.')
          setIsSaving(false)
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
          .from(bucket)
          .getPublicUrl(uploadPath)
        nextImageUrl = pub?.publicUrl ?? null
      }

      const patch: Partial<Course> = {}
      if ((course.course_name ?? '') !== courseName)
        patch.course_name = courseName
      if ((course.course_desc ?? '') !== courseDesc)
        patch.course_desc = courseDesc
      if (nextImageUrl !== course.image) patch.image = nextImageUrl ?? null
      const prevPath = toPath(course.course_map)
      const pathChanged =
        prevPath.length !== path.length ||
        !prevPath.every(
          (p, i) => p.lat === path[i]?.lat && p.lng === path[i]?.lng
        )
      if (pathChanged)
        patch.course_map = path as unknown as Course['course_map']

      const updated = await updateCourse(course.id, patch)
      if (!updated) {
        toast.error('수정에 실패했습니다.')
        return
      }

      toast.success('수정되었습니다.')
      await refresh()
      onClose()
    } catch {
      toast.error('수정 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
        <div className="w-[400px] p-6 bg-white rounded-lg shadow-lg">
          로딩 중…
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
        <div className="w-[400px] p-6 bg-white rounded-lg shadow-lg">
          코스를 불러오지 못했습니다.
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs"
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
        className="relative w-[400px] max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg"
      >
        <div className="flex items-center p-4">
          <button
            type="button"
            onClick={onClose}
            className={tw`
              p-1
              rounded-md hover:bg-gray-100 focus:outline-none
              cursor-pointer
            `}
            aria-label="뒤로가기"
          >
            <CircleArrowLeft />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className={tw`
            flex flex-col
            gap-4 p-5
          `}
        >
          <input
            ref={firstFieldRef}
            type="text"
            placeholder="코스명"
            name="course_name"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            required
            className={tw`
              w-full px-3 py-2
              border border-gray-300 rounded-md outline-none focus:ring-2
            `}
          />

          <textarea
            placeholder="코스 설명을 입력해주세요."
            value={courseDesc}
            name="course_description"
            onChange={e => setCourseDesc(e.target.value)}
            rows={3}
            className={tw`
              w-full px-3 py-2 resize-none
              border border-gray-200 rounded-md outline-none focus:ring-2
              text-gray-700 text-sm
            `}
          />

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
              py-2 hover:bg-gray-50
              border-2 border-dashed border-gray-300 rounded-md 
              text-gray-500
              cursor-pointer transition
            `}
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
                <p className="text-gray-500 text-sm">사진 업로드</p>
              </>
            )}
          </button>

          <div className="bg-gray-300 rounded-md text-center text-gray-600">
            {drawingMode ? (
              <DrawMap onSavePath={setPath} />
            ) : (
              <div className="flex flex-col items-center p-1">
                <div className="w-[340px] h-[200px] m-1 overflow-hidden bg-white rounded-md">
                  <KakaoMap coordData={path} />
                </div>

                <div className="w-[340px] m-1">
                  <button
                    type="button"
                    onClick={() => setDrawingMode(true)}
                    className={tw`
                      w-full py-3
                      bg-black rounded-md
                      text-white
                      cursor-pointer
                    `}
                  >
                    경로 수정하기
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Info />
            <p className="text-gray-500 text-[14px]">
              지점을 클릭해 경로를 그리고, '경로 저장' 버튼을 누르면
              경로데이터가 반영됩니다.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className={tw`
              w-full py-2
              rounded-md
              text-white
              transition cursor-pointer
              ${
                isSaving || !hasChanges
                  ? 'bg-gray-300 cursor-not-allowed'
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
