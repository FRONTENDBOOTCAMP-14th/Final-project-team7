import type { PropsWithChildren } from 'react'
import '@/styles/main.css'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko-KR">
      {/* <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head> */}
      <body className="md:max-w-[768px] mx-auto border-amber-700 border-4">
        <main>{children}</main>
      </body>
    </html>
  )
}
