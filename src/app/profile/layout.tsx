import HeaderClient from '@/components/profile/header-client'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderClient />
      {children}
    </>
  )
}
