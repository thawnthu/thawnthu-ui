import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MzApp",
  description: "Thawnthu App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; /* PUMPUAI TAWLH THEI LO */
          }
          * {
            box-sizing: border-box;
            font-family: system-ui, -apple-system, sans-serif;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
