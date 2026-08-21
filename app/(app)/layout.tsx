'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);

  const tabs = ['Home', 'Chat', 'Online(98)', 'Users', 'Notification(45)', 'Group', 'Category', 'Setting', 'Profile'];
  const currentTab = pathname.split('/')[2] || 'home'; // /home atang in 2-na
  const activeTab = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase().replace('(98)','').replace('(45)','');
    router.push(`/${route}`);
  }

  const accent = '#2563eb';
  const inactiveText = dark? '#aaa' : '#666';
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh'}}>
      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: card, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0}}>
        <div style={{fontSize: '18px', fontWeight: '700', color: accent}}>MzApp</div>
        <div style={{background: dark? '#2a2a2c' : '#f0f0f0', color: inactiveText, padding: '6px 14px', borderRadius: '20px', fontSize: '14px'}}>Search</div>
      </div>

      {/* MENU - WRAP */}
      <div style={{display: 'flex', gap: '20px', padding: '12px 16px', background: card, borderBottom: `1px solid ${border}`, flexWrap: 'wrap'}}>
        {tabs.map(tab => {
          const tabName = tab.replace('(98)','').replace('(45)','');
          const isActive = activeTab === tabName;
          return (
            <button key={tab} onClick={()=>handleTab(tabName)} style={{padding: '4px 0', border: 'none', background: 'none', color: isActive? accent : inactiveText, fontWeight: '700', cursor: 'pointer', fontSize: '15px', borderBottom: isActive? `3px solid ${accent}` : '3px solid transparent'}}>
              {tab}
            </button>
          )
        })}
      </div>

      {/* CONTENT */}
      <div style={{padding: '16px'}}>{children}</div>
    </div>
  )
}
