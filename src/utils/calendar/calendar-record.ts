export const paceToSeconds = (pace: string): number => {
  if (!pace) return 0
  const parts = pace.trim().split(/[:']/)
  if (parts.length !== 2) return 0
  const min = parseInt(parts[0].trim(), 10)
  const sec = parseInt(parts[1].trim(), 10)
  if (isNaN(min) ?? isNaN(sec)) return 0
  return min * 60 + sec
}

export const secondsToPace = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}'${String(s).padStart(2, '0')}"`
}
