'use client'
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Thu Tha', 'Chanchin', 'Hla']

export default function CategoryPage() {
  const [cat, setCat] = useState('Pasaltha')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => { fetchCat() }, [cat])
  
  const fetchCat = async () => {
    const q = query(collection(db, "thawnthu"), where("category", "==", cat));
    const snap = await getDocs(q);
    let data = snap.docs.map(doc => ({id: doc.id,...doc.data()}))
    data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    setPosts(data)
  }

  return (
    <main style={{padding: '20px', paddingBottom: '70px'}}>
      <h2>Category</h2>
      <div style={{display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px'}}>
        {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{padding: '8px 16px', background: cat===c? 'black' : '#eee', color: cat===c? 'white' : 'black', border: 'none', borderRadius: '20px', whiteSpace: 'nowrap'}}>{c}</button>)}
      </div>
      {posts.length === 0 && <p>He category ah hian thawnthu la awm lo</p>}
      {posts.map(p => <div key={p.id} style={{border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px'}}><h3>{p.title}</h3><p style={{whiteSpace: 'pre-line'}}>{p.content}</p></div>)}
      <BottomNav/>
    </main>
  )
}
