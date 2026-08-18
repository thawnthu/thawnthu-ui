'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { db } from './lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import BottomNav from './components/BottomNav';

export default function HomePage() {
  const [thawnthu, setThawnthu] = useState<any[]>([])
  const [dark, setDark] = useState(false)

  useEffect(() => {
    fetchData()
    if(typeof window!== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) setDark(true)
  }, [])

  const fetchData = async () => {
    const q = query(collection(db, "thawnthu"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setThawnthu(snapshot.docs.map(doc => ({id: doc.id,...doc.data()})))
  }

  const colors = {
    bg: dark? '#0a0a0a' : '#f8f9fa',
    card: dark? '#1a1a1a' : '#ffffff',
    color: dark? '#fff' : '#000',
    border: dark? '#2a2a2a' : '#e0e0e0',
    accent: '#6a11cb'
  }

  return (
    <main style={{'--bg': colors.bg, '--border': colors.border, '--accent': colors.accent, background: colors.bg, color: colors.color, minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px'}}>
      
      {/* TOP BAR NALH */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, background: colors.card, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
        <h2 style={{margin: 0, fontSize: '22px', fontWeight: '800'}}>Thawnthu</h2>
        <details style={{position: 'relative'}}>
          <summary style={{listStyle: 'none', cursor: 'pointer', fontSize: '26px', fontWeight: 'bold'}}>⋮</summary>
          <div style={{position: 'absolute', right: 0, background: colors.card, border: `1px solid ${colors.border}`, padding: '12px', borderRadius: '12px', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '120px'}}>
            <button onClick={() => setDark(!dark)} style={{display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: colors.color, cursor: 'pointer', padding: '8px 0', fontWeight: '600'}}>Dark Mode</button>
            <Link href="/about" style={{display: 'block', color: colors.color, textDecoration: 'none', padding: '8px 0', fontWeight: '600'}}>About</Link>
          </div>
        </details>
      </div>

      {/* POST LIST CARD */}
      <div style={{padding: '20px'}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', marginBottom: '20px'}}>Thawnthu Thar Ber</h1>
        {thawnthu.length === 0 && <p style={{textAlign: 'center', color: 'gray'}}>Thawnthu la awm lo</p>}
        {thawnthu.map((t) => (
          <div key={t.id} style={{background: colors.card, border: `1px solid ${colors.border}`, padding: '18px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
            
            {t.category && (
              <span style={{
                fontSize: '12px', 
                background: `var(--accent)`, 
                color: 'white',
                padding: '5px 12px', 
                borderRadius: '20px',
                fontWeight: '700'
              }}>
                {t.category}
              </span>
            )}

            <h3 style={{margin: '12px 0 8px 0', fontSize: '18px', fontWeight: '800'}}>{t.title}</h3>
            <p style={{whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0}}>{t.content}</p>
          </div>
        ))}
      </div>
      <BottomNav/>
    </main>
  )
}
