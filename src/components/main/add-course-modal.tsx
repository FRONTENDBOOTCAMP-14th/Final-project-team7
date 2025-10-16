'use client'

import { CircleArrowLeft, Info, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { addCourse } from '@/features/main/course-crud/courses-crud'
import type { Path } from '@/features/main/map-fetching/types'
import { tw } from '@/utils/tw'

import DrawMap from './draw-map'

interface AddCourseModalProps {
  onClose: () => void
}

export default function AddCourseModal({ onClose }: AddCourseModalProps) {
  const [courseName, setCourseName] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [paths, setPaths] = useState<Path[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // TODO: supabase insert 로직 추가 예정
  //   const formData = new FormData(e.currentTarget)
  //   console.log(formData)
  //   onClose()
  // }

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
        <form onSubmit={addCourse} className="p-5 flex flex-col gap-4">
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition cursor-pointer"
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  )
}
