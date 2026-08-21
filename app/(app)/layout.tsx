'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, MoreVertical, LogOut, Mail } from 'lucide-react'; // icon tan

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 4. Notification leh Users place thlak
  const tabs = ['Home', 'Chat', 'Online(98)', 'Notification(98)', 'Users', 'Group', 'Category', 'Profile', 'Setting'];

  const currentTab = pathname.split('/')[2] || 'home';
  const activeTab = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase().replace('(98)','');
    router.push(`/${route}`);
  }

  const accent = '#2563eb';
  const inactiveText = dark? '#aaa' : '#666';
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>

      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: card, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 20}}>

        {/* 1. MzApp font lian + mawi */}
        <div style={{fontSize: '22px', fontWeight: '800', color: accent, letterSpacing: '-0.5px'}}>MzApp</div>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {/* 2. Search Icon */}
          <button onClick={()=>alert('Search click')} style={{background: dark? '#2a2a2c' : '#f0f0f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
            <Search size={18} color={inactiveText}/>
          </button>

          {/* 2. Dot 3 Menu */}
          <div style={{position: 'relative'}}>
            <button onClick={()=>setShowMenu(!showMenu)} style={{background: dark? '#2a2a2c' : '#f0f0f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
              <MoreVertical size={18} color={inactiveText}/>
            </button>

            {showMenu && (
              <div style={{position: 'absolute', right: 0, top: '44px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px', width: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                <button onClick={()=>router.push('/contact')} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: inactiveText}}>
                  <Mail size={16}/> Contact us
                </button>
                <div style={{height: '1px', background: border, margin: '4px 0'}}></div> {/* line */}
                <button onClick={()=>router.push('/')} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red'}}>
                  <LogOut size={16}/> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MENU - 5. gap ti zim, 3. underline remove, 6. Setting tawp ber */}
      <div style={{display: 'flex', gap: '12px', padding: '10px 16px', background: card, borderBottom: `1px solid ${border}`, flexWrap: 'wrap', overflowX: 'auto'}}>
        {tabs.map(tab => {
          const tabName = tab.replace('(98)','');
          const isActive = activeTab === tabName;
          return (
            <button
              key={tab}
              onClick={()=>handleTab(tabName)}
              style={{
                padding: '6px 2px',
                border: 'none',
                background: 'none',
                color: isActive? accent : inactiveText,
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px',
                whiteSpace: 'nowrap'
                // 3. underline ka remove
              }}
            >
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
