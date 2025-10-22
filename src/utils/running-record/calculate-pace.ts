export function calculatePace(
  distance: string,
  hours: string,
  minutes: string,
  seconds: string
): string {
  const dist = Number(distance)
  const totalSec =
    (Number(hours) || 0) * 3600 +
    (Number(minutes) || 0) * 60 +
    (Number(seconds) || 0)

  if (
    dist > 0 &&
    totalSec > 0 &&
    Number.isFinite(dist) &&
    Number.isFinite(totalSec)
  ) {
    const paceValue = totalSec / dist
    const paceMin = Math.floor(paceValue / 60)
    const paceSec = Math.floor(paceValue % 60)
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}" / km`
  }

  return '--:-- / km'
}
