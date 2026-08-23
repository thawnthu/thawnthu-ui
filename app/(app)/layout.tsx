'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, LogOut, Mail } from 'lucide-react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, onSnapshot, query, where } from "firebase/firestore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) setShowMenu(false);
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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const allUsers = snap.docs.map(d => d.data() as any);
      setUsersCount(allUsers.length - 1 < 0? allUsers.length : allUsers.length - 1);
      const online = allUsers.filter(u => {
        if (!u.online ||!u.lastSeen) return false;
        try { const last = u.lastSeen.toDate? u.lastSeen.toDate() : new Date(u.lastSeen); return Date.now() - last.getTime() < 2 * 60 * 1000; } catch { return false; }
      });
      setOnlineCount(online.length > 0 && online.find(o => o.uid === auth.currentUser?.uid)? online.length - 1 : online.length);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let unsubChats: any = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { setChatUnread(0); return; }
      if (unsubChats) unsubChats();
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      unsubChats = onSnapshot(q, (snap) => {
        let count = 0;
        snap.docs.forEach(d => {
          const data = d.data() as any;
          if (data.lastSender && data.lastSender!== user.uid) {
            const unread = data.unread?.[user.uid] || 0;
            if (unread > 0) count += 1;
          }
        });
        setChatUnread(count);
      });
    });
    return () => { unsubAuth(); if (unsubChats) unsubChats(); };
  }, []);

  const tabs = [
    { name: 'Home', icon: '🏠', bg: '#e0f2fe' },
    { name: 'Chat', icon: '💬', bg: '#dcfce7' },
    { name: 'Status', icon: '⭕', bg: '#fef9c3' },
    { name: 'Notification', icon: '🔔', bg: '#fee2e2' },
    { name: 'Online', icon: '📶', bg: '#e0e7ff' },
    { name: 'Group', icon: '👥', bg: '#f3e8ff' },
    { name: 'Users', icon: '👤', bg: '#ffedd5' },
    { name: 'Profile', icon: '🙍', bg: '#d1fae5' },
    { name: 'Setting', icon: '⚙️', bg: '#ede9fe' },
  ];

  const currentPath = pathname.split('/')[1] || 'home';
  const activeTab = currentPath === ''? 'Home' : currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
  const handleTab = (tab: string) => { router.push(`/${tab.toLowerCase()}`); }
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
      {/* 1. HEADER FIXED - Home header hnuaiah lut tawh lo */}
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#8d31ce', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 0 12px', height: '50px'}}>
        <div style={{fontSize: '28px', fontWeight: '900', fontFamily: 'Outfit, Poppins, sans-serif', background: 'linear-gradient(90deg, #ffffff, #ffde59, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px'}}>MzApp</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
          <button type="button" onClick={()=>router.push('/search')} style={{background: 'none', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><Search size={22} color='#fff' strokeWidth={3}/></button>
          <div style={{position: 'relative'}} ref={menuRef}>
            <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><MoreVertical size={22} color='#fff' strokeWidth={3}/></button>
            {showMenu && (
              <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px', width: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 60}}>
                <button onClick={()=>{setShowMenu(false); router.push('/contact');}} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#666', fontWeight: '700', fontSize: '16px'}}><Mail size={20}/> Contact us</button>
                <div style={{height: '1px', background: border, margin: '4px 0'}}></div>
                <button onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red', fontWeight: '700', fontSize: '16px'}}><LogOut size={20}/> Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. HEADER hnuaiah lut lo turin paddingTop 50px */}
      <div style={{display: 'flex', paddingTop: '50px', minHeight: '100vh'}}>
        {/* 3. Menu fonts lian + ti zim */}
        <div style={{width: '30%', maxWidth: '125px', minWidth: '105px', background: card, borderRight: `1px solid ${border}`, position: 'fixed', top: '50px', left: 0, bottom: 0, overflowY: 'auto', padding: '6px 0', zIndex: 20}}>
          {tabs.map((tab, idx) => {
            const isActive = activeTab.toLowerCase() === tab.name.toLowerCase();
            return (
              <div key={tab.name}>
                <button onClick={()=>handleTab(tab.name)} style={{width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 8px', border: 'none', background: isActive? '#f3e8ff' : 'none', cursor: 'pointer', textAlign: 'left', borderLeft: isActive? '4px solid #8d31ce' : '4px solid transparent'}}>
                  <div style={{width: '26px', height: '26px', borderRadius: '7px', background: tab.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0}}>{tab.icon}</div>
                  <span style={{fontSize: '13.5px', fontWeight: isActive? '800' : '600', color: isActive? '#8d31ce' : '#333', whiteSpace: 'nowrap'}}>{tab.name}</span>
                </button>
                {idx < tabs.length - 1 && <div style={{height: '1px', background: '#f0f0f0', margin: '0 8px'}}></div>}
              </div>
            );
          })}
        </div>

        {/* Dinglam - 3. Menu zim vangin 70% */}
        <div style={{marginLeft: '30%', width: '70%', flex: 1, background: dark? '#0f0f10' : '#f5f5f5', minHeight: 'calc(100vh - 50px)'}}>
          <div style={{padding: '0px'}}>{children}</div>
        </div>
      </div>
    </div>
  )
}
