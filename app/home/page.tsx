'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = ['Home', 'Chat', 'Online(98)', 'Users', 'Notification(45)', 'Group', 'Category', 'Profile'];

  const currentTab = pathname.split('/')[1] || 'home';
  const activeTab = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase().replace('(98)','').replace('(45)','');
    router.push(`/${route}`);
  }

  const accent = '#2563eb'; // BLUE
  const inactiveText = '#555';
  const card = '#ffffff';
  const border = '#e0e0e0';

  return (
    <div>
      {/* MENU - TEXT ANG */}
      <div style={{
        width: '100%',
        display: 'flex',
        gap: '20px',
        padding: '12px 16px',
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
                padding: '8px 0',
                border: 'none',
                background: 'none',
                color: isActive? accent : inactiveText,
                fontWeight: isActive? '700' : '500',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontSize: '15px',
                borderBottom: isActive? `2px solid ${accent}` : '2px solid transparent',
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
          border: `1px solid ${border}`
        }}>
          Home Page
        </div>
      </div>
    </div>
  )
}
