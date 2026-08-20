'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dark] = useState(false);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const subtext = dark? '#a0a0a0' : '#666';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(!u) router.push('/login');
      setUser(u);
    });
    fetchMessages();
    return () => unsub();
  }, []);

  const fetchMessages = async () => {
    const q = query(collection(db, "chat"), orderBy("time", "asc"));
    const snap = await getDocs(q);
    setMessages(snap.docs.map(d => ({id: d.id,...d.data()})));
  }

  const sendMessage = async () => {
    if(!newMsg ||!user) return;
    setLoading(true);
    await addDoc(collection(db, "chat"), {
      text: newMsg,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      time: Timestamp.now()
    });
    setNewMsg('');
    fetchMessages();
    setLoading(false);
  }

  const timeAgo = (timestamp: any) => {
    if(!timestamp) return '';
    const date = timestamp.toDate();
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000 / 60);
    if(diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px', display: 'flex', flexDirection: 'column'}}>
      {/* HEADER */}
      <div style={{background: card, padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <button onClick={()=>router.back()} style={{background: 'none', border: 'none', fontSize: '20px'}}>←</button>
        <h2 style={{margin: 0, fontSize: '18px'}}>Chat Room</h2>
      </div>

      {/* CHAT MESSAGES */}
      <div style={{flex: 1, padding: '16px', overflowY: 'auto'}}>
        {messages.length === 0 && <p style={{textAlign: 'center', color: subtext}}>Beisei sawi rawh u</p>}
        {messages.map(msg => (
          <div key={msg.id} style={{marginBottom: '12px', display: 'flex', flexDirection: msg.authorId === user?.uid? 'row-reverse' : 'row'}}>
            <div style={{background: msg.authorId === user?.uid? accent : card, color: msg.authorId === user?.uid? 'white' : text, padding: '10px 14px', borderRadius: '18px', maxWidth: '70%', border: `1px solid ${border}`}}>
              <p style={{margin: 0, fontSize: '12px', fontWeight: '700', marginBottom: '4px'}}>{msg.authorName}</p>
              <p style={{margin: 0}}>{msg.text}</p>
              <p style={{margin: '4px 0 0 0', fontSize: '10px', opacity: 0.7}}>{timeAgo(msg.time)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={{padding: '12px', background: card, borderTop: `1px solid ${border}`, display: 'flex', gap: '8px'}}>
        <input
          value={newMsg}
          onChange={(e)=>setNewMsg(e.target.value)}
          onKeyDown={(e)=>e.key === 'Enter' && sendMessage()}
          placeholder="Message ziak rawh..."
          style={{flex: 1, padding: '12px', borderRadius: '20px', border: `1px solid ${border}`, background: bg, color: text, outline: 'none'}}
        />
        <button onClick={sendMessage} disabled={loading} style={{background: accent, color: 'white', border: 'none', padding: '0 20px', borderRadius: '20px', fontWeight: '700'}}>Send</button>
      </div>

      {/* FOOTER */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/chat" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>💬</span>Chat</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>🔔</span>Notification</button></Link>
      </div>
    </div>
  )
      }
