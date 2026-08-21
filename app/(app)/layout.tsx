'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, LogOut, Mail } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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

  const tabs = ['Home', 'Chat', 'Online(98)', 'Notification(98)', 'Group', 'Category', 'Profile', 'Users', 'Setting'];
  const currentPath = pathname.split('/')[1] || 'home';
  const activeTab = currentPath === ''? 'Home' : currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase().replace('(98)','');
    router.push(`/${route}`);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (e) {
      console.log("Logout error", e);
    }
  }

  const accent = '#2563eb';
  const activeColor = '#ff6b35';
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>

      {/* THLAKNA: He wrapper hi a sticky tur - header + menu awm reng tur */}
      <div style={{position: 'sticky', top: 0, zIndex: 20, background: card, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>

        {/* HEADER */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px 6px 16px', background: '#8d31ce'}}>
          <div style={{fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px'}}>MzApp</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0px'}}>
            <button onClick={()=>setShowSearch(!showSearch)} style={{background: 'none', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
              <Search size={22} color='#fff'/>
            </button>
            <div style={{position: 'relative'}} ref={menuRef}>
              <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                <MoreVertical size={22} color='#fff'/>
              </button>
              {showMenu && (
                <div style={{position: 'absolute', right: 0, top: '44px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px', width: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                  <button onClick={()=>router.push('/contact')} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#666', fontWeight: '700', fontSize: '16px'}}>
                    <Mail size={20}/> Contact us
                  </button>
                  <div style={{height: '1px', background: border, margin: '4px 0'}}></div>
                  <button onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red', fontWeight: '700', fontSize: '16px'}}>
                    <LogOut size={20}/> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSearch && (
          <div style={{padding: '8px 16px', background: card, borderBottom: `1px solid ${border}`}}>
            <input type="text" placeholder="Search..." autoFocus style={{width: '90%', maxWidth: '400px', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${border}`, background: dark? '#2a2a2c' : '#f5f5f5', color: dark? '#fff' : '#000', fontSize: '15px', outline: 'none'}}/>
          </div>
        )}

        {/* MENU - tunah chuan header rualin a awm reng tawh */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 16px 4px 16px', background: card, borderBottom: `2px solid ${border}`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto'}}>
            {tabs.slice(0,4).map(tab => {
              const tabName = tab.replace('(98)','');
              const isActive = activeTab === tabName;
              return (
                <button key={tab} onClick={()=>handleTab(tabName)} style={{padding: '6px 2px', border: 'none', background: 'none', color: isActive? activeColor : accent, fontWeight: '700', cursor: 'pointer', fontSize: '16px', whiteSpace: 'nowrap'}}>{tab}</button>
              )
            })}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto'}}>
            {tabs.slice(4,9).map(tab => {
              const tabName = tab.replace('(98)','');
              const isActive = activeTab === tabName;
              return (
                <button key={tab} onClick={()=>handleTab(tabName)} style={{padding: '6px 2px', border: 'none', background: 'none', color: isActive? activeColor : accent, fontWeight: '700', cursor: 'pointer', fontSize: '16px', whiteSpace: 'nowrap'}}>{tab}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* POST HO - hemi hnuai ah hian a tawlh chho tawh ang */}
      <div style={{padding: '16px'}}>{children}</div>
    </div>
  )
        }
