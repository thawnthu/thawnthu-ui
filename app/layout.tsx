'use client';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // 1. localStorage atangin dark mode chhiar
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDark(true);

    // 2. dark=true chuan body ah class dah
    if (dark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [dark]);

  // Setting page atangin dark mode thlak theih nan event ngaihtuah
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('darkMode');
      setDark(saved === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <html>
      <body style={{background: dark? '#0f0f10' : '#f5f5f5', color: dark? '#fff' : '#000', transition: '0.3s'}}>
        {children}
      </body>
    </html>
  );
}
