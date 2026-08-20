'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(3); // test atan 3. Tak ah chuan db atang in
  const [dark] = useState(false);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const subtext = dark? '#a0a0a0' : '#666';

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("time", "desc"));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({id: d.id,...d.data()})));
  }

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map(d => ({id: d.id,...d.data()})));
  }

  const getCatName = (id: string) => {
    return categories.find(c => c.id === id)?.name || "General";
  }

  const timeAgo = (timestamp: any) => {
    if(!timestamp) return '';
    const date = timestamp.toDate();
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000 / 3600);
    return diff < 24? `${diff}h ago` : `${Math.floor(diff/24)}d ago`;
  }

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  }

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>
      {/* HEADER */}
      <div style={{background: card, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu</h1>

        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          {/* SEARCH ICON */}
          <button onClick={()=>setSearchOpen(!searchOpen)} style={{background: 'none', border: 'none', fontSize: '22px'}}>🔍</button>

          {/* DOT 3 MENU */}
          <div style={{position: 'relative'}}>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', fontSize: '24px'}}>⋮</button>
            {menuOpen && (
              <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', width: '200px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                <button style={{padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px'}}>⚙️ Setting</button>
                <button style={{padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px'}}>📞 Contact Us</button>
                <button style={{padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px'}}>ℹ️ About</button>
                <hr style={{margin: '4px 0', border: 'none', borderTop: `1px solid ${border}`}}/>
                {user? (
                  <button onClick={handleLogout} style={{padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px'}}>🚪 Logout</button>
                ) : (
                  <Link href="/login" style={{textDecoration: 'none'}}><button onClick={()=>setMenuOpen(false)} style={{padding: '12px 16px', border: 'none', background: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px'}}>🔑 Login</button></Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      {searchOpen && (
        <div style={{padding: '12px 16px', background: card, borderBottom: `1px solid ${border}`}}>
          <input
            value={searchText}
            onChange={(e)=>setSearchText(e.target.value)}
            placeholder="Thawnthu zawng rawh..."
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text}}
          />
        </div>
      )}

      {/* POST LIST */}
      <div style={{padding: '16px'}}>
        {filteredPosts.length === 0 && <p>Post ala awm lo</p>}
        {filteredPosts.map(post => (
          <div key={post.id} style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, marginBottom: '16px'}}>
            <span style={{background: bg, padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600'}}>{getCatName(post.categoryId)}</span>
            <h2 style={{margin: '10px 0', fontSize: '20px'}}>{post.title}</h2>
            <p style={{margin: '0 0 10px 0', lineHeight: '1.6'}}>{post.content?.substring(0, 150)}... <Link href={`/post/${post.id}`} style={{color: accent, textDecoration: 'none', fontWeight: '700'}}>Read more</Link></p>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: subtext}}>
              <span>{post.authorName || 'Anonymous'} • {timeAgo(post.time)}</span>
              <div style={{display: 'flex', gap: '16px'}}>
                <span>(0) ❤️</span>
                <span>(0) 💬</span>
                <span>📤</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER BOLD + NOTIF BADGE */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/chat" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700'}}><span style={{fontSize: '22px'}}>💬</span>Chat</button></Link>

        {/* NOTIFICATION WITH BADGE */}
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}>
          <button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0', fontWeight: '700', position: 'relative'}}>
            <span style={{fontSize: '22px'}}>🔔</span>Notification
            {notifCount > 0 && <span style={{position: 'absolute', top: '4px', right: '25%', background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{notifCount}</span>}
          </button>
        </Link>
      </div>
    </div>
  )
}
