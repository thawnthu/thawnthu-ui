export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <style jsx global>{`
          html, body {
            height: 100%;
            overflow: hidden; /* PUMPUAI TAWLH THEI LO */
          }
          * {
            box-sizing: border-box;
            font-family: system-ui, -apple-system, sans-serif;
          }
        `}</style>
      </body>
    </html>
  )
}
