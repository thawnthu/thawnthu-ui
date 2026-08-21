'use client';
import { useEffect, useState } from 'react';

type FontSize = 'small' | 'medium' | 'large';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  // 1. A tir ah localStorage atangin kan la chhuak
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode');
    const savedFont = localStorage.getItem('fontSize');
    if(savedDark!== null) setDark(JSON.parse(savedDark));
    if(savedFont) setFontSize(JSON.parse(savedFont));
  }, []);

  // 2. Setting page dang ah a inthlak chuan he tah pawhin a hre nghal
  useEffect(() => {
    const handleStorage = () => {
      setDark(JSON.parse(localStorage.getItem('darkMode') || 'false'));
      setFontSize(JSON.parse(localStorage.getItem('fontSize') || '"medium"'));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const text = dark? '#ffffff' : '#000';

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        background: bg,
        color: text,
        fontSize: fontSizeMap[fontSize],
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'background 0.3s, color 0.3s, font-size 0.2s' // smooth an
      }}>
        {children}
      </body>
    </html>
  );
}
