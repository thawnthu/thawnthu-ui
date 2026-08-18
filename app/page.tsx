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

  const styles = {
    bg: dark? '#111' : '#fff',
    color: dark? '#fff' : '#000',
    border: dark? '#333' : '#eee'
  }

  return (
    <main style={{background: styles.bg, color: styles.color, minHeight: '100vh', paddingBottom: '70px'}}>
      
      {/* TOP BAR */}
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${styles.border}`, position: 'sticky', top: 0, background: styles.bg, zIndex: 10}}>
        <h2>Thawnthu</h2>
        <details>
          <summary style={{listStyle: 'none', cursor: 'pointer', fontSize: '24px'}}>⋮</summary>
          <div style={{position: 'absolute', right: 20, background: styles.bg, border: `1px solid ${styles.border}`, padding: '10px', borderRadius: '8px', marginTop: '5px'}}>
            <button onClick={() => setDark(!dark)} style={{display: 'block', background: 'none', border: 'none', color: styles.color, cursor: 'pointer'}}>Dark Mode</button>
            <Link href="/about" style={{display: 'block', color: styles.color, textDecoration: 'none', marginTop: '10px'}}>About</Link>
          </div>
        </details>
      </div>

      {/* POST LIST */}
      <div style={{padding: '20px'}}>
        <h1>Thawnthu Thar Ber</h1>
        {thawnthu.length === 0 && <p>Thawnthu la awm lo</p>}
        {thawnthu.map((t) => (
          <div key={t.id} style={{border: `1px solid ${styles.border}`, padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
            <p style={{fontSize: '12px', color: 'gray', marginBottom: '5px'}}>{t.category}</p>
            <h3 style={{margin: '5px 0'}}>{t.title}</h3>
            <p style={{whiteSpace: 'pre-line'}}>{t.content}</p>
          </div>
        ))}
      </div>
      <BottomNav/>
    </main>
  )
}
