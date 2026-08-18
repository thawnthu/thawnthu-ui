'use client'
import { useState } from 'react'

export default function Home() {
  const [page, setPage] = useState('home')
  const [dark, setDark] = useState(true)

  // Demo data - Firebase kan belh hunah heihi a in thlak ang
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

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>
      
      {/* HEADER */}
      {page === 'home' && (
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '16px'}}>
          <h1 style={{fontSize: '20px', fontWeight: '800'}}>Thawnthu</h1>
          <button onClick={()=>alert('Dark mode / About')} style={{background: 'none', border: 'none', color: text, fontSize: '20px'}}>⋯</button>
        </div>
      )}

      {/* PAGES */}
      {page === 'home' && posts.map((p,i)=>(
        <div key={i} style={{background: card, margin: '12px', padding: '16px', borderRadius: '12px'}}>
          <span style={{fontSize: '12px', background: '#2a2a2c', padding: '4px 8px', borderRadius: '6px'}}>{p.cat}</span>
          <h3 style={{margin: '10px 0 4px 0'}}>{p.title}</h3>
          <p style={{margin: 0, fontSize: '12px', color: '#aaa'}}>{p.author} • {p.time}</p>
        </div>
      ))}

      {page === 'category' && categories.map((c,i)=>(
        <div key={i} style={{background: card, margin: '12px', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between'}}>
          <span>{c.name}</span>
          <span style={{color: '#aaa'}}>({c.count})</span>
        </div>
      ))}

      {page === 'post' && (
        <div style={{padding: '16px'}}>
          <h2>Post siam</h2>
          <input placeholder="Title" style={{width: '100%', padding: '10px', marginBottom: '10px', background: card, border: '1px solid #333', color: text, borderRadius: '8px'}}/>
          <textarea placeholder="I thawnthu ziak rawh" rows={6} style={{width: '100%', padding: '10px', marginBottom: '10px', background: card, border: '1px solid #333', color: text, borderRadius: '8px'}}/>
          <select style={{width: '100%', padding: '10px', marginBottom: '10px', background: card, border: '1px solid #333', color: text, borderRadius: '8px'}}>
            {categories.map(c=><option key={c.name}>{c.name}</option>)}
          </select>
          <button style={{width: '100%', padding: '12px', background: '#5865F2', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700'}}>Post</button>
        </div>
      )}

      {page === 'notification' && (
        <div style={{padding: '16px'}}>
          <div style={{background: card, padding: '12px', borderRadius: '8px', marginBottom: '10px'}}>
            <p style={{margin: 0}}><b>Mami</b> in <b>Pasaltha</b> ah post thar a siam</p>
          </div>
          <div style={{background: card, padding: '12px', borderRadius: '8px'}}>
            <p style={{margin: 0}}><b>Zuala</b> in i post ah comment a dah</p>
          </div>
        </div>
      )}

      {/* BOTTOMNAV */}
      <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, background: card, borderTop: '1px solid #2a2a2c', display: 'flex', justifyContent: 'space-around', padding: '10px 0'}}>
        <button onClick={()=>setPage('home')} style={{background: 'none', border: 'none', color: page==='home'?'#5865F2':'#aaa'}}>🏠 Home</button>
        <button onClick={()=>setPage('category')} style={{background: 'none', border: 'none', color: page==='category'?'#5865F2':'#aaa'}}>📂 Category</button>
        <button onClick={()=>setPage('post')} style={{background: 'none', border: 'none', color: page==='post'?'#5865F2':'#aaa'}}>✍️ Post</button>
        <button onClick={()=>setPage('notification')} style={{background: 'none', border: 'none', color: page==='notification'?'#5865F2':'#aaa'}}>🔔 Notification</button>
      </div>
    </div>
  )
}
