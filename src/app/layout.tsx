import type { PropsWithChildren } from 'react'
import '@/styles/main.css'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko-KR">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
