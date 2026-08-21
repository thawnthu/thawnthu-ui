'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type FontSize = 'small' | 'medium' | 'large';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const router = useRouter();
  const pathname = usePathname();

  // 1. A tir ah localStorage atangin kan la chhuak
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode');
    const savedFont = localStorage.getItem('fontSize');
    const savedLogin = localStorage.getItem('isLoggedIn'); // Login check belh

    if(savedDark!== null) setDark(JSON.parse(savedDark));
    if(savedFont) setFontSize(JSON.parse(savedFont));
    if(savedLogin) setIsLoggedIn(JSON.parse(savedLogin));

    // Active tab path atangin set
    const currentTab = pathname.split('/')[1] || 'home';
    setActiveTab(currentTab.charAt(0).toUpperCase() + currentTab.slice(1));
  }, [pathname]);

  // 2. Setting page dang ah a inthlak chuan he tah pawhin a hre nghal
  useEffect(() => {
    const handleStorage = () => {
      setDark(JSON.parse(localStorage.getItem('darkMode') || 'false'));
      setFontSize(JSON.parse(localStorage.getItem('fontSize') || '"medium"'));
      setIsLoggedIn(JSON.parse(localStorage.getItem('isLoggedIn') || 'false'));
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
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#8B2DCE';

  const tabs = ['Home', 'Chat', 'Online(98)', 'Users', 'Notification(45)', 'Group', 'Category', 'Profile'];

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    const route = tab.toLowerCase().replace('(98)','').replace('(45)','');
    router.push(`/${route}`);
  }

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
        transition: 'background 0.3s, color 0.3s, font-size 0.2s'
      }}>

        {/* 3. LOGIN TAWH CHUAN CHIAH HEADER + MENU LANG TUR */}
        {isLoggedIn && (
          <>
            <div style={{
              background: card,
              padding: '16px',
              borderBottom: `1px solid ${border}`,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: '0.3s'
            }}>
              <h1 style={{color: accent, fontSize: '28px', fontWeight: '800', margin: 0}}>MzApp</h1>
              <button style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={text}><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              background: card,
              borderBottom: `1px solid ${border}`,
              overflowX: 'auto',
              position: 'sticky',
              top: '69px',
              zIndex: 9,
              transition: '0.3s'
            }}>
              {tabs.map(tab => {
                const tabName = tab.replace('(98)','').replace('(45)','');
                return (
                  <button
                    key={tab}
                    onClick={()=>handleTab(tabName)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeTab === tabName? accent : (dark? '#2a2a2c' : '#f0f0f0'),
                      color: activeTab === tabName? 'white' : text,
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}>
                    {tab}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div style={{padding: '16px'}}>
          {children}
        </div>
      </body>
    </html>
  );
                      }
