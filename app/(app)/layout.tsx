'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, LogOut, Mail } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // 2. Search na tan
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div style={{fontSize: '22px', fontWeight: '800', color: accent, letterSpacing: '-0.5px'}}>MzApp</div>

        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
          {/* 2. Search click a hmet theih + search box rawn chhuak */}
          <button onClick={()=>setShowSearch(!showSearch)} style={{background: 'none', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
            <Search size={22} color='#000'/>
          </button>

          <div style={{position: 'relative'}} ref={menuRef}>
            <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
              <MoreVertical size={22} color='#000'/>
            </button>

            {showMenu && (
              <div style={{position: 'absolute', right: 0, top: '44px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px', width: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                <button onClick={()=>router.push('/contact')} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: inactiveText, fontWeight: '700'}}>
                  <Mail size={16}/> Contact us
                </button>
                <div style={{height: '1px', background: border, margin: '4px 0'}}></div>
                <button onClick={()=>router.push('/')} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red', fontWeight: '700'}}>
                  <LogOut size={16}/> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search box */}
      {showSearch && (
        <div style={{padding: '8px 16px', background: card, borderBottom: `1px solid ${border}`}}>
          <input
            type="text"
            placeholder="Search..."
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${border}`,
              background: dark? '#2a2a2c' : '#f5f5f5',
              color: dark? '#fff' : '#000',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* MENU */}
      {/* 1. borderBottom ti chhah + 3. gap ti zim */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 16px 4px 16px', background: card, borderBottom: `3px solid ${border}`}}>
        <div style={{display: 'flex', gap: '16px', overflowX: 'auto'}}>
          {tabs.slice(0,5).map(tab => {
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
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
        <div style={{display: 'flex', gap: '16px', overflowX: 'auto'}}>
          {tabs.slice(5,9).map(tab => {
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
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{padding: '16px'}}>{children}</div>
    </div>
  )
                                                                 }
