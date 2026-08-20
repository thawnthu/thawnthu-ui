'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, orderBy, query, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('Profile'); // Profile, User, Online, Status, Group
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(3);
  const [dark] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#8B2DCE'; // i duh ang var uk
  const subtext = dark? '#a0a0a0' : '#666';
  const iconColor = text;

  const tabs = ['Profile', 'User', 'Online (0)', 'Status', 'Group'];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(!u) router.push('/login'); // 1. ACCOUNT AWM LOH CHUAN LOGIN AH TIR
      else setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if(loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    borderRadius: '20px',
    border: `1px solid ${isActive? accent : border}`,
    background: isActive? accent : card,
    color: isActive? 'white' : text,
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  });

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>

      {/* HEADER - THAWNTHU + SEARCH + DOT3 */}
      <div style={{background: card, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu</h1>
        <div style={{display: 'flex', gap: '20px'}}>
          <button onClick={()=>setSearchOpen(!searchOpen)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor}><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>
      </div>

      {/* 2. TAB BUTTONS - COMMENT BUTTON STYLE */}
      <div style={{background: card, padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', gap: '10px', overflowX: 'auto'}}>
        {tabs.map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)} style={tabButtonStyle(activeTab === tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div style={{padding: '16px'}}>
        {activeTab === 'Profile' && <ProfileTab user={user} card={card} border={border} accent={accent} text={text} subtext={subtext}/>}
        {activeTab === 'User' && <UserTab card={card} border={border} text={text}/>}
        {activeTab === 'Online (0)' && <OnlineTab card={card} border={border} text={text}/>}
        {activeTab === 'Status' && <StatusTab card={card} border={border} text={text} accent={accent}/>}
        {activeTab === 'Group' && <GroupTab card={card} border={border} text={text} accent={accent}/>}
      </div>

      {/* FOOTER - HOME ANG CHIAH */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/chat" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>💬</span>Chat</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700', position: 'relative'}}><span style={{fontSize: '22px'}}>🔔</span>Notification{notifCount > 0 && <span style={{position: 'absolute', top: '4px', right: '25%', background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'}}>{notifCount}</span>}</button></Link>
      </div>
    </div>
  )
}

// 3. PROFILE TAB
function ProfileTab({user, card, border, accent, text, subtext}: any) {
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `profile/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setPhotoURL(url);
    await updateDoc(doc(db, "users", user.uid), {photoURL: url, name});
  }

  return (
    <div style={{background: card, padding: '20px', borderRadius: '16px', border: `1px solid ${border}`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'}}>
        <label style={{cursor: 'pointer'}}>
          <img src={photoURL || 'https://i.pravatar.cc/100'} style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`}}/>
          <input type="file" onChange={handleUpload} style={{display: 'none'}}/>
        </label>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="I hming" style={{padding: '10px', borderRadius: '8px', border: `1px solid ${border}`, width: '100%', background: bg, color: text}}/>
        <textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Bio dah rawh" style={{padding: '10px', borderRadius: '8px', border: `1px solid ${border}`, width: '100%', height: '80px', background: bg, color: text}}/>
        <button onClick={()=>updateDoc(doc(db, "users", user.uid), {name, bio})} style={{background: accent, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', width: '100%'}}>Save Profile</button>
      </div>
    </div>
  )
}

// 4. USER TAB - USER ZAWNG ZAWNG
function UserTab({card, border, text}: any) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(()=>{ getDocs(collection(db, "users")).then(snap=>setUsers(snap.docs.map(d=>d.data()))) },[]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      {users.map(u=>(
        <Link href={`/chat/private/${u.uid}`} key={u.uid} style={{textDecoration: 'none'}}>
          <div style={{background: card, padding: '12px', borderRadius: '12px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px'}}>
            <img src={u.photoURL || 'https://i.pravatar.cc/50'} style={{width: '50px', height: '50px', borderRadius: '50%'}}/>
            <span style={{color: text, fontWeight: '700'}}>{u.name}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// 5. ONLINE TAB
function OnlineTab({card, border, text}: any) {
  return <div style={{background: card, padding: '20px', borderRadius: '16px', border: `1px solid ${border}`}}>Online (89) - Hetah online list a lang ang. UserTab ang chiah</div>
}

// 6. STATUS TAB - WHATSAPP ANG
function StatusTab({card, border, text, accent}: any) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, borderLeft: `4px solid ${accent}`}}>
        <p style={{fontWeight: '700'}}>Ka Status dah rawh</p>
      </div>
      <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`}}>
        <p style={{fontWeight: '700'}}>Friends Status</p>
        <p style={{color: subtext}}>Ahnuai ah friend te status a lang ang</p>
      </div>
    </div>
  )
}

// 7. GROUP TAB
function GroupTab({card, border, text, accent}: any) {
  return (
    <div>
      <button style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', width: '100%', marginBottom: '16px'}}> + Create Group</button>
      <div style={{background: card, padding: '20px', borderRadius: '16px', border: `1px solid ${border}`}}>I siam tawh group te an lang ang</div>
    </div>
  )
}
