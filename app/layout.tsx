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
      <body style={{ margin: 0, background: '#0f0f10', color: '#fff', fontFamily: 'system-ui' }}>
        {children}
      </body>
    </html>
  )
}
