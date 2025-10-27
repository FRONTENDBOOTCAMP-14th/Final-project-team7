import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Spotify 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Spotify 토큰 발급 실패', details: data },
        { status: res.status }
      )
    }

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    })
  } catch {
    return NextResponse.json(
      { error: '서버 내부 오류로 토큰 발급 실패' },
      { status: 500 }
    )
  }
}
