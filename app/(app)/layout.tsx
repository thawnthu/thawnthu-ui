'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, LogOut, Mail } from 'lucide-react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, onSnapshot, query, where } from "firebase/firestore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropRef.current &&!dropRef.current.contains(event.target as Node)) setShowDropDown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cleanupFn: (() => void) | null = null;
    let intervalId: any = null;
    const setOnline = async (uid: string) => { try { await setDoc(doc(db, "users", uid), { online: true, lastSeen: serverTimestamp() }, { merge: true }); } catch {} };
    const setOffline = async (uid: string) => { try { await setDoc(doc(db, "users", uid), { online: false, lastSeen: serverTimestamp() }, { merge: true }); } catch {} };
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (cleanupFn) { cleanupFn(); cleanupFn = null; }
      if (intervalId) clearInterval(intervalId);
      if (!user) return;
      const uid = user.uid;
      setOnline(uid);
      intervalId = setInterval(() => setOnline(uid), 30000);
      const handleVisibility = () => { if (document.visibilityState === 'visible') setOnline(uid); else setOffline(uid); };
      const handleBeforeUnload = () => setOffline(uid);
      document.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handleBeforeUnload);
      cleanupFn = () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handleBeforeUnload);
        setOffline(uid);
        if (intervalId) clearInterval(intervalId);
      };
    });
    return () => { unsubAuth(); if (cleanupFn) cleanupFn(); if (intervalId) clearInterval(intervalId); };
  }, []);

  const tabs = [
    { name: 'Home', icon: '🏠', bg: '#e0f2fe' },
    { name: 'Chat', icon: '💬', bg: '#dcfce7' },
    { name: 'Notification', icon: '🔔', bg: '#fee2e2' },
    { name: 'Group', icon: '👥', bg: '#f3e8ff' },
    { name: 'Users', icon: '👤', bg: '#ffedd5' },
    { name: 'Profile', icon: '🙍', bg: '#d1fae5' },
    { name: 'Setting', icon: '⚙️', bg: '#ede9fe' },
  ];

  const currentPath = pathname.split('/')[1] || 'home';
  const activeTab = currentPath === ''? 'Home' : currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
  const handleTab = (tab: string) => { setShowDropDown(false); router.push(`/${tab.toLowerCase()}`); }
  const handleLogout = async () => {
    try {
      if (auth.currentUser) await setDoc(doc(db, "users", auth.currentUser.uid), { online: false, lastSeen: serverTimestamp() }, { merge: true });
      await signOut(auth);
      router.replace('/');
    } catch (e) { console.log("Logout error", e); }
  }
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>
      {/* HEADER - MzApp veilam, search + humberger dinglam - Dot 3 a bo */}
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#8d31ce', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 0 12px', height: '52px'}}>
        <div style={{
          fontSize: '28px',
          fontWeight: '900',
          fontFamily: 'Outfit, Poppins, sans-serif',
          background: 'linear-gradient(90deg, #ffffff, #ffde59, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          MzApp
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <button type="button" onClick={()=>router.push('/search')} style={{background: 'none', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><Search size={22} color='#fff' strokeWidth={3}/></button>

          {/* Dot 3 awmna ah humberger menu - i sawi ang chiah */}
          <div style={{position: 'relative'}} ref={dropRef}>
            <button
              onClick={()=>setShowDropDown(!showDropDown)}
              style={{
                background: '#fff',
                border: '2px solid #6d6d6d',
                borderRadius: '6px',
                width: '38px',
                height: '38px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <div style={{width: '20px', height: '4px', background: '#6d6d6d', borderRadius: '10px'}}></div>
              <div style={{width: '20px', height: '4px', background: '#6d6d6d', borderRadius: '10px'}}></div>
              <div style={{width: '20px', height: '4px', background: '#6d6d6d', borderRadius: '10px'}}></div>
            </button>

            {showDropDown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                background: card,
                border: `1px solid ${border}`,
                borderRadius: '14px',
                width: '210px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                zIndex: 60,
                overflow: 'hidden',
                padding: '6px 0'
              }}>
                {tabs.map((tab, idx) => {
                  const isActive = activeTab.toLowerCase() === tab.name.toLowerCase();
                  return (
                    <div key={tab.name}>
                      <button onClick={()=>handleTab(tab.name)} style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        border: 'none',
                        background: isActive? '#f3e8ff' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderLeft: isActive? '4px solid #8d31ce' : '4px solid transparent'
                      }}>
                        <div style={{width: '30px', height: '30px', borderRadius: '8px', background: tab.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0}}>{tab.icon}</div>
                        <span style={{fontSize: '14.5px', fontWeight: isActive? '800' : '600', color: isActive? '#8d31ce' : '#333'}}>{tab.name}</span>
                      </button>
                      {idx < tabs.length - 1 && <div style={{height: '1px', background: '#f0f0f0', margin: '0 12px'}}></div>}
                    </div>
                  );
                })}

                <div style={{height: '1px', background: '#e5e7eb', margin: '6px 0'}}></div>

                {/* Humberger menu hnuaiah Contact us leh Logout - icon mawi nen */}
                <button onClick={()=>{setShowDropDown(false); router.push('/contact');}} style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: '4px solid transparent'
                }}>
                  <div style={{width: '30px', height: '30px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <Mail size={16} color="#0ea5e9"/>
                  </div>
                  <span style={{fontSize: '14.5px', fontWeight: 600, color: '#333'}}>Contact us</span>
                </button>

                <button onClick={handleLogout} style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: '4px solid transparent'
                }}>
                  <div style={{width: '30px', height: '30px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <LogOut size={16} color="#ef4444"/>
                  </div>
                  <span style={{fontSize: '14.5px', fontWeight: 700, color: '#ef4444'}}>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{paddingTop: '52px', minHeight: '100vh', background: dark? '#0f0f10' : '#f5f5f5'}}>
        <div style={{width: '100%', maxWidth: '100%'}}>
          {children}
        </div>
      </div>

      {showDropDown && (
        <div onClick={()=>setShowDropDown(false)} style={{position: 'fixed', inset: 0, top: '52px', background: 'rgba(0,0,0,0.15)', zIndex: 40}}></div>
      )}
    </div>
  )
}
