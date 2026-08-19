'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "./lib/firebase";
import Link from "next/link"; // BELH

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  status: string;
  createdAt: Timestamp;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({ id: doc.id,...doc.data() })) as Post[];
      setPosts(postsData);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const timeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  const NavButton = ({icon, label, href}: {icon: string, label: string, href: string}) => (
    <Link href={href} style={{textDecoration: 'none', flex: 1}}>
      <button style={{
        background: 'none', border: 'none', color: href === '/'? accent : subtext,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%', padding: '8px 0'
      }}>
        <span style={{fontSize: '22px', marginBottom: '4px'}}>{icon}</span>
        {label}
      </button>
    </Link>
  );

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: bg, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu v2</h1>
        <button onClick={()=>setDark(!dark)} style={{background: 'none', border: 'none', color: text, fontSize: '22px', cursor: 'pointer'}}>{dark? '☀️' : '🌙'}</button>
      </div>

      <div style={{flex: 1, overflowY: 'auto', paddingBottom: '80px'}}>
        {loading? <p style={{padding: '20px'}}>Loading...</p> :
        posts.length === 0? <p style={{padding: '20px'}}>Post ala awm lo</p> :
        posts.map((p)=>(
          <div key={p.id} style={{background: card, margin: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <span style={{fontSize: '12px', background: border, padding: '6px 10px', borderRadius: '8px', fontWeight: '600'}}>{p.category}</span>
            <h3 style={{margin: '12px 0 8px 0', fontSize: '18px', fontWeight: '700'}}>{p.title}</h3>
            <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>{p.content.substring(0,150)}...</p>
            <p style={{margin: 0, fontSize: '12px', color: subtext}}>{p.author} • {timeAgo(p.createdAt)}</p>
          </div>
        ))}
      </div>

      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <NavButton icon="🏠" label="Home" href="/"/>
        <NavButton icon="📂" label="Category" href="/category"/>
        <NavButton icon="✍️" label="Post" href="/post"/>
        <NavButton icon="🔔" label="Notify" href="/notification"/>
      </div>
    </div>
  )
}
