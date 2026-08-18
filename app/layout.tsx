export const metadata = {
  title: 'Thawnthu',
  description: 'Thawnthu chhiarna website',
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
