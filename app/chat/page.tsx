'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // 1. USER STATE KAN HMANG
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const bg = '#F8F9FA';
  const card = '#FFFFFF';
  const text = '#1A1A1A';
  const border = '#E9ECEF';
  const accent = '#8B2DCE';
  const subtext = '#6C757D';

  const tabs = ['Home', 'Chat', 'Online(98)', 'Users', 'Notification(45)', 'Group', 'Category', 'Profile'];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(!u) router.push('/'); else setUser(u); // 2. USER AWM CHUAN KAN DAH
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); setMenuOpen(false); }

  // 3. BACK DAN TUR FUNCTION THAR
  const getBackLink = () => {
    return user? '/chat' : '/'; // Login tawh chuan /chat, login loh chuan /
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if(loading) return <div style={{padding: '20px'}}>Loading...</div>

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 16px', borderRadius: '20px', border: 'none',
    background: isActive? accent : '#F1F3F5', color: isActive? 'white' : text,
    fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
  });
  const menuItemStyle: React.CSSProperties = { padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '15px', cursor: 'pointer', color: text, fontWeight: '700' };
  const menuDivider: React.CSSProperties = { margin: '0', border: 'none', borderTop: `1px solid ${border}` };

  return (
    <div style={{background: bg, color: text, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>

      {/* HEADER */}
      <div style={{flexShrink: 0, background: card, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`}}>
        <h1 style={{fontSize: '22px', fontWeight: '800', margin: 0, color: accent}}>MzApp</h1>
        <div style={{position: 'relative'}} ref={menuRef}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}><svg width="24" height="24" viewBox="0 0 24 24" fill={text}><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', width: '200px', zIndex: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
              {/* 4. LINK AH BACK DAN KAN PE */}
              <Link href={`/setting?back=${getBackLink()}`} style={{textDecoration: 'none'}}><button style={menuItemStyle}><span>⚙️</span><span>Setting</span></button></Link>
              <hr style={menuDivider}/>
              <Link href={`/about?back=${getBackLink()}`} style={{textDecoration: 'none'}}><button style={menuItemStyle}><span>ℹ️</span><span>About</span></button></Link>
              <hr style={menuDivider}/>
              <Link href={`/contact?back=${getBackLink()}`} style={{textDecoration: 'none'}}><button style={menuItemStyle}><span>📞</span><span>Contact Us</span></button></Link>
              <hr style={menuDivider}/>
              <button onClick={handleLogout} style={menuItemStyle}><span>🚪</span><span>Logout</span></button>
            </div>
          )}
        </div>
      </div>

      {/* TABS WRAP */}
      <div style={{flexShrink: 0, background: card, padding: '12px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: `1px solid ${border}`}}>
        {tabs.map(tab => (<button key={tab} onClick={()=>setActiveTab(tab)} style={tabButtonStyle(activeTab === tab)}>{tab}</button>))}
      </div>

      {/* CONTENT */}
      <div style={{flexGrow: 1, overflowY: 'auto', padding: '16px'}}>
        {activeTab === 'Home' && <PageCard title="Home Page" card={card} border={border}/>}
        {activeTab === 'Chat' && <ChatTab card={card} border={border} text={text} subtext={subtext}/>}
        {activeTab === 'Online(98)' && <PageCard title="Online(98)" card={card} border={border}/>}
        {activeTab === 'Users' && <UsersTab card={card} border={border} text={text}/>}
        {activeTab === 'Notification(45)' && <PageCard title="Notification(45)" card={card} border={border}/>}
        {activeTab === 'Group' && <PageCard title="Group Page" card={card} border={border}/>}
        {activeTab === 'Category' && <PageCard title="Category Page" card={card} border={border}/>}
        {activeTab === 'Profile' && <ProfileTab user={user} card={card} border={border} accent={accent} text={text}/>}
      </div>
    </div>
  )
}

function PageCard({title, card, border}: any){ return <div style={{background: card, padding: '40px', borderRadius: '20px', border: `1px solid ${border}`, textAlign: 'center', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>{title}</div> }
function ChatTab({card, border, text, subtext}: any) { return <PageCard title="Chat List" card={card} border={border}/> }
function UsersTab({card, border, text}: any) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(()=>{ getDocs(collection(db, "users")).then(snap=>setUsers(snap.docs.map(d=>({id: d.id,...d.data()})))) },[]);
  return (<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>{users.map((u: any)=>(<div key={u.id} style={{background: card, padding: '12px', borderRadius: '16px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px'}}><img src={u.photoURL || 'https://i.pravatar.cc/50'} style={{width: '50px', height: '50px', borderRadius: '50%'}}/><span style={{color: text, fontWeight: '700'}}>{u.name || 'No Name'}</span></div>))}</div>)
}
function ProfileTab({user, card, border, accent, text}: any) {
  if(!user) return null;
  return (<div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, textAlign: 'center'}}><img src={user.photoURL || 'https://i.pravatar.cc/100'} style={{width: '90px', height: '90px', borderRadius: '50%', border: `3px solid ${accent}`}}/><h2 style={{margin: '12px 0 0 0'}}>{user.displayName || 'No Name'}</h2></div>)
}
