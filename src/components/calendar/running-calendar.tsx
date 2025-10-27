'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { CalendarProps } from 'react-calendar'
import Calendar from 'react-calendar'

import type { RunningRecord } from '@/hooks/calednar/use-running-records'

interface RunningCalendarProps {
  courses: RunningRecord[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

const formatDateToYMD = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`

export default function RunningCalendar({
  courses,
  currentMonth,
  onMonthChange,
}: RunningCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const tileClassName: CalendarProps['tileClassName'] = ({ date, view }) => {
    if (view !== 'month') return ''
    const month = currentMonth.getMonth()
    if (date.getMonth() !== month) {
      return 'flex flex-col justify-between items-center relative min-h-[45px] p-2 rounded-lg text-center text-sm font-light text-gray-200 transition-all'
    }

    const classes: string[] = [
      'flex flex-col justify-between items-center relative p-2 min-h-[45px] rounded-lg text-center text-sm font-light hover:bg-gray-100 transition-all',
    ]

    const day = date.getDay()
    if (day === 0) classes.push('text-red-500')
    else if (day === 6) classes.push('text-blue-500')

    const today = new Date()
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      classes.push('bg-yellow-50 hover:bg-yellow-100')
    }

    const dayString = formatDateToYMD(date)
    const hasData = courses.some(
      c => formatDateToYMD(new Date(c.date)) === dayString
    )
    if (hasData) {
      classes.push(
        'bg-blue-50 bg-opacity-10 hover:bg-blue-50 hover:bg-opacity-35'
      )
    }

    return classes.join(' ')
  }

  const renderTileContent: CalendarProps['tileContent'] = ({ date, view }) => {
    if (view !== 'month') return null
    const month = currentMonth.getMonth()
    if (date.getMonth() !== month) return null

    const dayString = formatDateToYMD(date)
    const record = courses.find(
      c => formatDateToYMD(new Date(c.date)) === dayString
    )
    if (!record) return null

    const distance = parseFloat(record.distance)
    const isLongDistance = distance > 5

    return (
      <div
        className={`absolute z-[2] px-0.5 bottom-0.5 left-1/2 rounded text-[10px] font-light -translate-x-1/2 ${
          isLongDistance ? 'bg-[#073462] text-white' : 'bg-[#74a9f4] text-white'
        }`}
      >
        {distance.toFixed(1)}km
      </div>
    )
  }

  const handlePrevMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  return (
    <div className="p-5 w-[363px] max-w-full rounded-lg shadow-[0_0_6px_0_rgba(0,0,0,0.25)] bg-white font-['Pretendard','Arial',sans-serif]">
      <div className="flex items-center justify-center pb-5 gap-2">
        <button
          onClick={handlePrevMonth}
          className="flex justify-center items-center w-7 h-7 rounded-full border border-[var(--color-basic-100)] bg-white hover:bg-[#f3f3f3] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="flex items-center select-none gap-1 text-[var(--color-basic-400)] text-lg font-normal">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </span>

        <button
          onClick={handleNextMonth}
          className="flex justify-center items-center w-7 h-7 rounded-full border border-[var(--color-basic-100)] bg-white hover:bg-[#f3f3f3] transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-custom w-full">
        <Calendar
          locale="ko-KR"
          value={selectedDate}
          onChange={value => {
            if (value instanceof Date) setSelectedDate(value)
          }}
          activeStartDate={currentMonth}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) onMonthChange(activeStartDate)
          }}
          showNavigation={false}
          formatDay={(_, date) => String(date.getDate())}
          tileClassName={tileClassName}
          tileContent={renderTileContent}
          maxDetail="month"
          minDetail="month"
          calendarType="gregory"
        />
      </div>
    </div>
  )
}
