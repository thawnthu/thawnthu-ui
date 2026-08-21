'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false); // i dark mode i neih chuan true/false ah dah la

  const tabs = ['Home', 'Chat', 'Online(98)', 'Users', 'Notification(45)', 'Group', 'Category', 'Profile'];

  const currentTab = pathname.split('/')[1] || 'home';
  const activeTab = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase().replace('(98)','').replace('(45)','');
    router.push(`/${route}`);
  }

  const accent = '#2563eb'; // BLUE
  const inactiveText = dark? '#aaa' : '#666';
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh'}}>
      {/* MENU - TEXT ANG */}
      <div style={{
        width: '100%',
        display: 'flex',
        gap: '24px', // inkar zau
        padding: '14px 20px',
        background: card,
        borderBottom: `1px solid ${border}`,
        overflowX: 'auto',
        boxSizing: 'border-box'
      }}>
        {tabs.map(tab => {
          const tabName = tab.replace('(98)','').replace('(45)','');
          const isActive = activeTab === tabName;
          return (
            <button
              key={tab}
              onClick={()=>handleTab(tabName)}
              style={{
                padding: '6px 0',
                border: 'none',
                background: 'none', // background bo
                color: isActive? accent : inactiveText, // active blue, dang grey
                fontWeight: isActive? '700' : '500',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontSize: '15px',
                borderBottom: isActive? `3px solid ${accent}` : '3px solid transparent', // hnuai ah line chhah
                transition: '0.2s'
              }}>
              {tab}
            </button>
          )
        })}
      </div>

      {/* CONTENT */}
      <div style={{padding: '16px'}}>
        <div style={{
          background: card,
          padding: '40px 20px',
          borderRadius: '16px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '600',
          border: `1px solid ${border}`,
          color: dark? '#fff' : '#000'
        }}>
          Home Page
        </div>
      </div>
    </div>
  )
}
