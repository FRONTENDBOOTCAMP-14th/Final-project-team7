import CalendarClient from '@/components/calendar/calendar-client'
import '@/styles/main.css'

export default function RunningCalendarPage() {
  return (
    <div className="flex justify-center items-start w-full min-h-screen">
      <CalendarClient />
    </div>
  )
}
