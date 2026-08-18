'use client';
import { useState } from 'react';

export default function Home() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);

  const categories = [
    { name: 'Pasaltha', count: 98 },
    { name: 'Fiamthu', count: 78 },
    { name: 'Love Story', count: 45 },
  ];
  
  const posts = [
    { title: 'Ramhuai pui', cat: 'Pasaltha', author: 'Zuala', time: '2h ago' },
    { title: 'Zan in ka nuih zat', cat: 'Fiamthu', author: 'Mami', time: '5h ago' },
  ];

  const bg = dark ? '#0f0f10' : '#f5f5f5';
  const card = dark ? '#1a1a1c' : '#fff';
  const text = dark ? '#fff' : '#000';
  const border = dark ? '#2a2a2c' : '#ddd';

  const toggleDark = () => {
    setDark(!dark);
    setMenuOpen(false);
  };

  const openAbout = () => {
    setPage('about');
    setMenuOpen(false);
  };

  const NavButton = ({icon, label, p}:any) => (
    <button onClick={()=>setPage(p)} style={{
      background: 'none', 
      border: 'none', 
      color: page===p?'#5865F2':'#aaa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer'
    }}>
      <span style={{fontSize: '22px', marginBottom: '2px'}}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* HEADER */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px',
        background: bg,
        borderBottom: `1px solid ${border}`,
        flexShrink: 0
      }}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu</h1>
        <div style={{position: 'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer'}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '35px', background: card, border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 0', minWidth: '160px', zIndex: 20}}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
              <button onClick={openAbout} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>ℹ️ About</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, overflowY: 'auto', paddingBottom: '20px'}}>
        {page === 'home' && posts.map((p,i)=>(
          <div key={i} style={{background: card, margin: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <span style={{fontSize: '12px', background: border, padding: '6px 10px', borderRadius: '8px', fontWeight: '600'}}>{p.cat}</span>
            <h3 style={{margin: '12px 0 6px 0', fontSize: '20px', fontWeight: '700'}}>{p.title}</h3>
            <p style={{margin: 0, fontSize: '14px', color: '#aaa'}}>{p.author} • {p.time}</p>
          </div>
        ))}
        {page === 'about' && <div style={{padding: '20px', textAlign: 'center'}}><h2>About</h2></div>}
      </div>

      {/* FOOTER */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0'}}>
        <NavButton icon="🏠" label="Home" p="home"/>
        <NavButton icon="📂" label="Category" p="category"/>
        <NavButton icon="✍️" label="Post" p="post"/>
        <NavButton icon="🔔" label="Notification" p="notification"/>
      </div>
    </div>
  )
}
