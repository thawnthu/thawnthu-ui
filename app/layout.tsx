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
      <body style={{margin: 0, fontFamily: 'Arial'}}>{children}</body>
    </html>
  )
}
