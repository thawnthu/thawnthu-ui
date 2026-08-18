'use client'
import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import BottomNav from './components/BottomNav';

export default function HomePage() {
  const [thawnthu, setThawnthu] = useState<any[]>([])
  const [dark, setDark] = useState(false)

  useEffect(() => {
    fetchData()
    if(window.matchMedia('(prefers-color-scheme: dark)').matches) setDark(true)
  }, [])

  const fetchData = async () => {
    const q = query(collection(db, "thawnthu"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setThawnthu(snapshot.docs.map(doc => ({id: doc.id,...doc.data()})))
  }

  const styles = {
    bg: dark? '#111' : '#fff',
    color: dark? '#fff' : '#000',
    border: dark? '#333' : '#eee'
  }

  return (
    <main style={{'--bg': styles.bg, '--border': styles.border, background: styles.bg, color: styles.color, minHeight: '100vh', paddingBottom: '70px'}} onClick={() => document.documentElement.style.setProperty('--bg', styles.bg)}>
      
      {/* TOP BAR */}
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${styles.border}`}}>
        <h2>Thawnthu</h2>
        <details>
          <summary style={{listStyle: 'none', cursor: 'pointer', fontSize: '24px'}}>⋮</summary>
          <div style={{position: 'absolute', right: 20, background: styles.bg, border: `1px solid ${styles.border}`, padding: '10px', borderRadius: '8px'}}>
            <button onClick={() => setDark(!dark)} style={{display: 'block', background: 'none', border: 'none', color: styles.color}}>Dark Mode</button>
            <Link href="/about" style={{display: 'block', color: styles.color, textDecoration: 'none', marginTop: '10px'}}>About</Link>
          </div>
        </details>
      </div>

      {/* POST LIST */}
      <div style={{padding: '20px'}}>
        <h1>Thawnthu Thar Ber</h1>
        {thawnthu.map((t) => (
          <div key={t.id} style={{border: `1px solid ${styles.border}`, padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
            <p style={{fontSize: '12px', color: 'gray'}}>{t.category}</p>
            <h3>{t.title}</h3>
            <p style={{whiteSpace: 'pre-line'}}>{t.content}</p>
          </div>
        ))}
      </div>
      <BottomNav/>
    </main>
  )
}
