import CalendarClient from '@/components/calendar/calendar-client'
import '@/styles/main.css'

export default function RunningCalendarPage() {
  return (
    <div className="flex justify-center items-start min-h-screen py-10">
      <CalendarClient />
    </div>
  )
}
