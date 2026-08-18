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
      <body style={{ margin: 0, background: '#f8f9fa', fontFamily: 'system-ui' }}>
        {children}
      </body>
    </html>
  )
}
