'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, LogOut, Mail } from 'lucide-react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, onSnapshot } from "firebase/firestore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
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

  // ONLINE SYSTEM
  useEffect(() => {
    let cleanupFn: (() => void) | null = null;
    let intervalId: any = null;
    const setOnline = async (uid: string) => {
      try { await setDoc(doc(db, "users", uid), { online: true, lastSeen: serverTimestamp() }, { merge: true }); } catch {}
    };
    const setOffline = async (uid: string) => {
      try { await setDoc(doc(db, "users", uid), { online: false, lastSeen: serverTimestamp() }, { merge: true }); } catch {}
    };
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (cleanupFn) { cleanupFn(); cleanupFn = null; }
      if (intervalId) clearInterval(intervalId);
      if (!user) return;
      const uid = user.uid;
      setOnline(uid);
      intervalId = setInterval(() => setOnline(uid), 30000);
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') setOnline(uid); else setOffline(uid);
      };
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

  // THLAKNA: Users & Online zat chhiar
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const allUsers = snap.docs.map(d => d.data() as any);
      // mahni tel lo a count
      const others = allUsers.filter(u => u.uid!== auth.currentUser?.uid);
      setUsersCount(allUsers.length - 1 < 0? allUsers.length : allUsers.length - 1);

      // online dik tak - 2 min chhung a active
      const online = allUsers.filter(u => {
        if (!u.online ||!u.lastSeen) return false;
        try {
          const last = u.lastSeen.toDate? u.lastSeen.toDate() : new Date(u.lastSeen);
          return Date.now() - last.getTime() < 2 * 60 * 1000;
        } catch { return false; }
      });
      setOnlineCount(online.length > 0 && online.find(o => o.uid === auth.currentUser?.uid)? online.length - 1 : online.length);
    });
    return () => unsub();
  }, []);

  const tabs = ['Home', 'Chat', 'Online', 'Notification', 'Group', 'Category', 'Profile', 'Users', 'Setting'];
  const currentPath = pathname.split('/')[1] || 'home';
  const activeTab = currentPath === ''? 'Home' : currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  const getTabLabel = (tab: string) => {
    if (tab === 'Users') return `Users(${usersCount})`;
    if (tab === 'Online') return `Online(${onlineCount})`;
    if (tab === 'Notification') return `Notification(98)`;
    return tab;
  };

  const handleTab = (tab: string) => {
    const route = tab.toLowerCase();
    router.push(`/${route}`);
  }

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), { online: false, lastSeen: serverTimestamp() }, { merge: true });
      }
      await signOut(auth);
      router.replace('/');
    } catch (e) { console.log("Logout error", e); }
  }

  const accent = '#2563eb';
  const activeColor = '#ff6b35';
  const card = dark? '#1a1a1c' : '#ffffff';
  const border = dark? '#2a2a2c' : '#e0e0e0';

  return (
    <div style={{background: dark? '#0f0f10' : '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>

      {/* HEADER - top 0 */}
      <div style={{position: 'sticky', top: 0, zIndex: 30, background: '#8d31ce', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px 6px 16px'}}>
        <div style={{fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px'}}>MzApp</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0px'}}>
          <div style={{position: 'relative'}} ref={menuRef}>
            <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
              <MoreVertical size={22} color='#fff'/>
            </button>
            {showMenu && (
              <div style={{position: 'absolute', right: 0, top: '44px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px', width: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 40}}>
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

      {/* MENU - top 44px ah ding reng */}
      <div style={{position: 'sticky', top: '44px', zIndex: 20, background: card, display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 16px 4px 16px', borderBottom: `2px solid ${border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto'}}>
          {tabs.slice(0,4).map(tab => {
            const isActive = activeTab === tab;
            return (<button key={tab} onClick={()=>handleTab(tab)} style={{padding: '6px 2px', border: 'none', background: 'none', color: isActive? activeColor : accent, fontWeight: '700', cursor: 'pointer', fontSize: '16px', whiteSpace: 'nowrap'}}>{getTabLabel(tab)}</button>)
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto'}}>
          {tabs.slice(4,9).map(tab => {
            const isActive = activeTab === tab;
            return (<button key={tab} onClick={()=>handleTab(tab)} style={{padding: '6px 2px', border: 'none', background: 'none', color: isActive? activeColor : accent, fontWeight: '700', cursor: 'pointer', fontSize: '16px', whiteSpace: 'nowrap'}}>{getTabLabel(tab)}</button>)
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding: '0px'}}>{children}</div>
    </div>
  )
                }
