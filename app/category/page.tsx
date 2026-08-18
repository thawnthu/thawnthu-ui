'use client'
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['Zawngkim', 'Pasaltha', 'Fiamthu', 'Thu Tha', 'Chanchin', 'Hla']

export default function CategoryPage() {
  const [cat, setCat] = useState('Zawngkim')
  const [allPosts, setAllPosts] = useState<any[]>([])

  useEffect(() => { fetchAll() }, [])
  
  const fetchAll = async () => {
    const snap = await getDocs(collection(db, "thawnthu"));
    let data = snap.docs.map(doc => ({id: doc.id,...doc.data()}))
    data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    setAllPosts(data)
  }

  const posts = cat === 'Zawngkim'? allPosts : allPosts.filter(p => p.category === cat)

  return (
    <main style={{padding: '20px', paddingBottom: '80px', background: '#f8f9fa', minHeight: '100vh'}}>
      <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '20px'}}>Category</h2>
      <div style={{display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px'}}>
        {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{padding: '10px 18px', background: cat===c? 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)' : 'white', color: cat===c? 'white' : 'black', border: '1px solid #ddd', borderRadius: '25px', whiteSpace: 'nowrap', fontWeight: '700'}}>{c}</button>)}
      </div>
      {posts.length === 0 && <p style={{textAlign: 'center', color: 'gray'}}>He category ah hian thawnthu la awm lo</p>}
      {posts.map(p => (
        <div key={p.id} style={{background: 'white', border: '1px solid #eee', padding: '18px', marginBottom: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
          {p.category && <span style={{fontSize: '12px', background: '#6a11cb', color: 'white', padding: '5px 12px', borderRadius: '20px', fontWeight: '700'}}>{p.category}</span>}
          <h3 style={{margin: '12px 0 8px 0', fontSize: '18px', fontWeight: '800'}}>{p.title}</h3>
          <p style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>{p.content}</p>
        </div>
      ))}
      <BottomNav/>
    </main>
  )
}
