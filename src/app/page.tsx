import type { PropsWithChildren } from 'react'

export default function Page({ children }: PropsWithChildren) {
  return (
    <section>
      <h1>Final Project Template</h1>
      {children}
    </section>
  )
}
