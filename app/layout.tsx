export const metadata = {
  title: 'Thawnthu',
  description: 'Thawnthu chhiarna',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f0f10', color: '#fff', fontFamily: 'system-ui', paddingBottom: '70px' }}>
        {children}
      </body>
    </html>
  )
}
