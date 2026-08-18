'use client'
import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';

export default function Home() {
  const [thawnthu, setThawnthu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "thawnthu"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
      setThawnthu(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1>Thawnthu Zawng Zawng</h1>
        <Link href="/login" style={{padding: '10px 20px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '6px'}}>
          Post Tu Login
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      
      {thawnthu.length === 0 && <p>Thawnthu la awm lo</p>}

      {thawnthu.map((t) => (
        <div key={t.id} style={{border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '15px'}}>
          <h2>{t.title}</h2>
          <p style={{color: '#555'}}>{t.content.substring(0, 200)}...</p>
          <p style={{fontSize: '12px', color: '#999'}}>Ziaktu: {t.author}</p>
        </div>
      ))}
    </main>
  )
}
