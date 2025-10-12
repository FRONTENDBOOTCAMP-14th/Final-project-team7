export function isValidRecordForm({
  course,
  date,
  distance,
  hours,
  minutes,
  seconds,
  pace,
}: {
  course: string
  date: string
  distance: string
  hours: string
  minutes: string
  seconds: string
  pace: string | null
}) {
  const hasTime =
    Number(hours) > 0 || Number(minutes) > 0 || Number(seconds) > 0
  return (
    course !== 'all' &&
    !!date &&
    !!distance &&
    hasTime &&
    !!pace &&
    !Number.isNaN(parseFloat(distance))
  )
}
