export const byCreatedDesc = <T extends { created_at: string }>(a: T, b: T) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

export const byCreatedAsc = <T extends { created_at: string }>(a: T, b: T) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()

export const byNameKoAsc = <T extends { course_name?: string; name?: string }>(
  a: T,
  b: T
) =>
  String(a.course_name ?? a.name ?? '').localeCompare(
    String(b.course_name ?? b.name ?? ''),
    'ko',
    { sensitivity: 'base' }
  )
