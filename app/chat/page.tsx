'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('User'); // Profile ai in User hmasa ber ah kan dah
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dark] = useState(false);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#8B2DCE';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(!u) router.push('/login');
      else setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if(loading) return <div style={{padding: '20px', background: bg, color: text}}>Loading...</div>

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>
      <div style={{background: card, padding: '16px', borderBottom: `1px solid ${border}`}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu Chat</h1>
      </div>

      <div style={{background: card, padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', gap: '10px', overflowX: 'auto'}}>
        {['Profile', 'User', 'Online', 'Status', 'Group'].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding: '10px 16px', borderRadius: '20px', border: `1px solid ${activeTab === tab? accent : border}`, background: activeTab === tab? accent : card, color: activeTab === tab? 'white' : text, fontWeight: '700'}}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{padding: '16px'}}>
        {activeTab === 'Profile' && <div style={{background: card, padding: '20px', borderRadius: '16px'}}>Profile Tab - Hemi chhungah hian error a awm</div>}
        {activeTab === 'User' && <UserTab card={card} border={border} text={text}/>}
        {activeTab === 'Online' && <div style={{background: card, padding: '20px'}}>Online Tab</div>}
        {activeTab === 'Status' && <div style={{background: card, padding: '20px'}}>Status Tab</div>}
        {activeTab === 'Group' && <div style={{background: card, padding: '20px'}}>Group Tab</div>}
      </div>

      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/"><button style={{background: 'none', border: 'none', color: text, padding: '12px'}}>🏠 Home</button></Link>
        <Link href="/chat"><button style={{background: 'none', border: 'none', color: accent, padding: '12px'}}>💬 Chat</button></Link>
      </div>
    </div>
  )
}

function UserTab({card, border, text}: any) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(()=>{
    getDocs(collection(db, "users"))
   .then(snap=>setUsers(snap.docs.map(d=>({id: d.id,...d.data()}))))
   .catch(err=>console.log(err))
  },[]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      {users.length === 0 && <p>User an la awm lo</p>}
      {users.map((u: any)=>(
        <div key={u.id} style={{background: card, padding: '12px', borderRadius: '12px', border: `1px solid ${border}`}}>
          <span style={{color: text, fontWeight: '700'}}>{u.name || 'No Name'}</span>
        </div>
      ))}
    </div>
  )
}
