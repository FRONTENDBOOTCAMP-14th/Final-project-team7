import './calculate-pace'

export function parseDuration(duration: string) {
  const hourMatch = duration.match(/(\d+)시간/)
  const minuteMatch = duration.match(/(\d+)분/)
  const secondMatch = duration.match(/(\d+)초/)
  return {
    hours: hourMatch ? hourMatch[1] : '0',
    minutes: minuteMatch ? minuteMatch[1] : '0',
    seconds: secondMatch ? secondMatch[1] : '0',
  }
}
