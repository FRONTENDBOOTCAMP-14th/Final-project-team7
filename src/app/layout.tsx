import '@/styles/main.css'
import type { PropsWithChildren } from 'react'

import { Providers } from '@/app/providers'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko-KR">
      {/* <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head> */}
      <body className="md:max-w-[768px] mx-auto border-amber-700 border-4">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
