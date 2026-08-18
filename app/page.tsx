'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: Timestamp;
}

export default function Home() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // FIREBASE ATANGA DATA LAK
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
         ...doc.data()
        })) as Post[];
        setPosts(postsData);
      } catch (err) {
        console.log(err)
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = [
    { name: 'Pasaltha', count: posts.filter(p => p.category === 'Pasaltha').length },
    { name: 'Fiamthu', count: posts.filter(p => p.category === 'Fiamthu').length },
    { name: 'Love Story', count: posts.filter(p => p.category === 'Love Story').length },
    { name: 'Sual lam', count: posts.filter(p => p.category === 'Sual lam').length },
    { name: 'Nula palai', count: posts.filter(p => p.category === 'Nula palai').length },
  ];
  
  // Time "2h ago" ang a chantir na
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

  const bg = dark ? '#0f0f10' : '#f5f5f5';
  const card = dark ? '#1a1a1c' : '#ffffff';
  const text = dark ? '#ffffff' : '#000';
  const subtext = dark ? '#a0a0a0' : '#555';
  const border = dark ? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  const toggleDark = () => {
    setDark(!dark);
    setMenuOpen(false);
  };

  const openAbout = () => {
    setPage('about');
    setMenuOpen(false);
  };

  const NavButton = ({icon, label, p}: {icon: string, label: string, p: string}) => (
    <button onClick={()=>setPage(p)} style={{
      background: 'none', 
      border: 'none', 
      color: page===p ? accent : subtext,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      flex: 1,
      padding: '8px 0'
    }}>
      <span style={{fontSize: '22px', marginBottom: '4px'}}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif'}}>
      
      {/* HEADER */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px',
        background: bg,
        borderBottom: `1px solid ${border}`,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu v2</h1>
        <div style={{position: 'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer', lineHeight: 1}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
              <button onClick={openAbout} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>ℹ️ About</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, overflowY: 'auto', paddingBottom: '80px'}}>
        
        {page === 'home' && (
          <>
            {loading? <p style={{padding: '20px'}}>Loading...</p> : 
            posts.length === 0? <p style={{padding: '20px'}}>Post ala awm lo. Admin ah kal la dah rawh</p> :
            posts.map((p)=>(
              <div key={p.id} style={{background: card, margin: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
                <span style={{fontSize: '12px', background: border, padding: '6px 10px', borderRadius: '8px', fontWeight: '600'}}>{p.category}</span>
                <h3 style={{margin: '12px 0 8px 0', fontSize: '18px', fontWeight: '700'}}>{p.title}</h3>
                <p style={{margin: 0, fontSize: '14px', color: subtext}}>{p.author} • {timeAgo(p.createdAt)}</p>
              </div>
            ))}
            }
          </>
        )}

        {page === 'category' && (
          <div style={{padding: '12px'}}>
            {categories.map((c,i)=>(
              <div key={i} style={{background: card, margin: '10px 0', padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '16px', fontWeight: '700'}}>{c.name}</span>
                <span style={{fontSize: '14px', color: subtext}}>{c.count} posts</span>
              </div>
            ))}
          </div>
        )}

        {page === 'about' && (
          <div style={{padding: '30px 20px', textAlign: 'center'}}>
            <h2 style={{fontSize: '24px'}}>Thawnthu App</h2>
            <p style={{color: subtext, marginTop: '12px'}}>Mizo thawnthu chhiar nan</p>
          </div>
        )}

        {page !== 'home' && page !== 'category' && page !== 'about' && (
          <div style={{padding: '30px 20px', textAlign: 'center', color: subtext}}>
            <h2>Coming Soon</h2>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        background: card, 
        borderTop: `1px solid ${border}`, 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '0',
        flexShrink: 0,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: '100%'
      }}>
        <NavButton icon="🏠" label="Home" p="home"/>
        <NavButton icon="📂" label="Category" p="category"/>
        <NavButton icon="✍️" label="Post" p="post"/>
        <NavButton icon="🔔" label="Notify" p="notification"/>
      </div>
    </div>
  )
}
