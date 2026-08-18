export const metadata = {
  title: 'Thawnthu App',
  description: 'Mizo Thawnthu chhiarna',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
