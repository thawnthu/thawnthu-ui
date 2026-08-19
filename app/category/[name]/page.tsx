'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Post = { id: string; title: string; content: string; category: string; author: string; createdAt: any; }

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const q = query(collection(db, "posts"), where("category", "==", categoryName), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(doc => ({ id: doc.id,...doc.data() })) as Post[]);
      setLoading(false);
    };
    fetchPosts();
  }, [categoryName]);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const toggleDark = () => setDark(!dark);

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>
      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, background: bg, zIndex: 20}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu V2</h1>
        <div style={{position: 'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer'}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px 0', minWidth: '180px'}}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px'}}>{dark? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
              <Link href="/about" style={{display: 'block', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>ℹ️ About</Link>
              <Link href="/contact" style={{display: 'block', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>📞 Contact</Link>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding: '12px', paddingBottom: '80px'}}>
        <Link href="/category" style={{color: '#5865F2', textDecoration: 'none'}}>← Category kir</Link>
        <h2 style={{fontSize: '22px', fontWeight: '800', margin: '16px 0'}}>{categoryName}</h2>

        {loading? <p>Loading...</p> :
        posts.length === 0? <p>He category ah hian post ala awm lo</p> :
        posts.map((p)=>(
          <div key={p.id} style={{background: card, margin: '12px 0', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700'}}>{p.title}</h3>
            <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>{p.content.substring(0,200)}...</p>
            <p style={{margin: 0, fontSize: '12px', color: subtext}}>{p.author} • {timeAgo(p.createdAt)}</p>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: '#5865F2', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/post" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>✍️</span>Post</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🔔</span>Notify</button></Link>
      </div>
    </div>
  )
          }
