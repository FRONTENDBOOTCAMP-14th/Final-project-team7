import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

export default function RunningLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'rounded-lg shadow-md text-sm font-medium',
            success: 'bg-blue-100 border border-blue-300 text-blue-800 ',
            error: 'bg-red-100 border border-red-300 text-red-800 ',
          },
        }}
      />
    </>
  )
}
