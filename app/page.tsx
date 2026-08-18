'use client'
import  { useState } from 'react'

export default function Home() {
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(true)

  const categories = [
    { name: 'Pasaltha', count: 98 },
    { name: 'Fiamthu', count: 78 },
    { name: 'Love Story', count: 45 },
  ]
  
  const posts = [
    { title: 'Ramhuai pui', cat: 'Pasaltha', author: 'Zuala', time: '2h ago' },
    { title: 'Zan in ka nuih zat', cat: 'Fiamthu', author: 'Mami', time: '5h ago' },
  ]

  const bg = dark ? '#0f0f10' : '#f5f5f5'
  const card = dark ? '#1a1a1c' : '#fff'
  const text = dark ? '#fff' : '#000'
  const border = dark ? '#2a2a2c' : '#ddd'

  const toggleDark = () => {
    setDark(!dark)
    setMenuOpen(false)
  }

  const openAbout = () => {
    setPage('about')
    setMenuOpen(false)
  }

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
  )

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      
      {/* HEADER - PAGE ZAWNG ZAWNG AH AWM VEK */}
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
          <button 
            onClick={()=>setMenuOpen(!menuOpen)} 
            style={{background: 'none', border: 'none', color: text, fontSize: '28px', lineHeight: '10px', letterSpacing: '2px', cursor: 'pointer'}}
          >
            ⋮
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', 
              right: 0, 
              top: '35px',
              background: card, 
              border: `1px solid ${border}`,
              borderRadius: '8px',
              padding: '8px 0',
              minWidth: '160px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 20
            }}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>
                {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={openAbout} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>
                ℹ️ About
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, overflowY: 'auto', paddingBottom: '20px'}}>
        {/* HOME */}
        {page === 'home' && posts.map((p,i)=>(
          <div key={i} style={{background: card, margin: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <span style={{fontSize: '12px', background: border, padding: '6px 10px', borderRadius: '8px', fontWeight: '600'}}>{p.cat}</span>
            <h3 style={{margin: '12px 0 6px 0', fontSize: '20px', fontWeight: '700'}}>{p.title}</h3>
            <p style={{margin: 0, fontSize: '14px', color: '#aaa'}}>{p.author} • {p.time}</p>
          </div>
        ))}

        {/* CATEGORY */}
        {page === 'category' && categories.map((c,i)=>(
          <div key={i} style={{background: card, margin: '12px', padding: '18px', borderRadius: '16px', border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600'}}>
            <span>{c.name}</span>
            <span style={{color: '#aaa'}}>({c.count})</span>
          </div>
        ))}

        {/* POST */}
        {page === 'post' && (
          <div style={{padding: '16px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '800', marginBottom: '16px'}}>Post thar siam</h2>
            <input placeholder="Title" style={{width: '100%', padding: '14px', marginBottom: '12px', background: card, border: `1px solid ${border}`, color: text, borderRadius: '10px', fontSize: '15px'}}/>
            <textarea placeholder="I thawnthu ziak rawh" rows={6} style={{width: '100%', padding: '14px', marginBottom: '12px', background: card, border: `1px solid ${border}`, color: text, borderRadius: '10px', fontSize: '15px'}}/>
            <select style={{width: '100%', padding: '14px', marginBottom: '16px', background: card, border: `1px solid ${border}`, color: text, borderRadius: '10px', fontSize: '15px'}}>
              {categories.map(c=><option key={c.name}>{c.name}</option>)}
            </select>
            <button style={{width: '100%', padding: '14px', background: '#5865F2', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer'}}>Post</button>
          </div>
        )}

        {/* NOTIFICATION */}
        {page === 'notification' && (
          <div style={{padding: '12px'}}>
            <div style={{background: card, padding: '14px', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${border}`}}>
              <p style={{margin: 0, fontSize: '15px'}}><b>Mami</b> in <b>Pasaltha</b> ah post thar a siam</p>
            </div>
            <div style={{background: card, padding: '14px', borderRadius: '12px', border: `1px solid ${border}`}}>
              <p style={{margin: 0, fontSize: '15px'}}><b>Zuala</b> in i post ah comment a dah</p>
            </div>
          </div>
        )}

        {/* ABOUT PAGE */}
        {page === 'about' && (
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800'}}>Thawnthu</h2>
            <p style={{fontSize: '15px', color: '#aaa', lineHeight: '1.6'}}>
              Mizo thawnthu chhiarna leh ziahna hmun. <br/>
              Pasaltha, Fiamthu, Love Story te ngaihthlak nan.
            </p>
            <p style={{fontSize: '14px', color: '#666', marginTop: '30px'}}>Version 1.0.0</p>
          </div>
        )}
      </div>

      {/* FOOTER - PAGE ZAWNG ZAWNG AH AWM VEK */}
      <div style={{
        background: card, 
        borderTop: `1px solid ${border}`, 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '12px 0',
        flexShrink: 0
      }}>
        <NavButton icon="🏠" label="Home" p="home"/>
        <NavButton icon="📂" label="Category" p="category"/>
        <NavButton icon="✍️" label="Post" p="post"/>
        <NavButton icon="🔔" label="Notification" p="notification"/>
      </div>
    </div>
  )
}
