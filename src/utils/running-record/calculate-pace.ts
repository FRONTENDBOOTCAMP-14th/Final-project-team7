export function calculatePace(
  distance: string,
  hours: string,
  minutes: string,
  seconds: string
) {
  const dist = parseFloat(distance)
  const totalSec =
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0)

  if (dist > 0 && totalSec > 0) {
    const paceValue = totalSec / dist
    const paceMin = Math.floor(paceValue / 60)
    const paceSec = Math.floor(paceValue % 60)
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}" / km`
  }
  return '--:-- / km'
}
