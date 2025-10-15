import '@/styles/main.css'
import type { PropsWithChildren } from 'react'

import { Providers } from '@/app/providers'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko-KR">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
