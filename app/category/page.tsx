'use client'
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore'; // Timestamp kan belh
import BottomNav from '../components/BottomNav';

// 1. HEI HI A CHUNG BER AH BELH RAWH
type Thawnthu = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Timestamp;
}

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Thu Tha', 'Chanchin', 'Hla']

export default function CategoryPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [posts, setPosts] = useState<Thawnthu[]>([]) // 2. any[] a tang in Thawnthu[] ah thlak

  useEffect(() => { fetchCounts() }, [])

  const fetchCounts = async () => {
    const snap = await getDocs(collection(db, "thawnthu"));
    // 3. as Thawnthu[] kan belh
    let allPosts = snap.docs.map(doc => ({id: doc.id,...doc.data()} as Thawnthu))

    let newCounts: Record<string, number> = {}
    CATEGORIES.forEach(c => {
      newCounts[c] = allPosts.filter(p => p.category === c).length
    })
    setCounts(newCounts)
  }

  const handleSelect = async (cat: string) => {
    setSelectedCat(cat)
    const snap = await getDocs(collection(db, "thawnthu"));
    let allPosts = snap.docs.map(doc => ({id: doc.id,...doc.data()} as Thawnthu)) // 4. hetah pawh
    let filtered = allPosts.filter(p => p.category === cat)
    filtered.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    setPosts(filtered)
  }

  const colors = {
    bg: '#f8f9fa',
    card: '#ffffff',
    border: '#e0e0e0',
    accent: '#6a11cb'
  }

  return (
    <main style={{padding: '20px', paddingBottom: '80px', background: colors.bg, minHeight: '100vh'}}>
      <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '20px'}}>Category</h2>

      {!selectedCat && CATEGORIES.map(c => (
        <div 
          key={c} 
          onClick={() => handleSelect(c)}
          style={{
            background: colors.card, 
            padding: '18px 20px', 
            borderRadius: '16px', 
            marginBottom: '12px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            border: `1px solid ${colors.border}`
          }}
        >
          <span style={{fontSize: '17px', fontWeight: '700'}}>{c}</span>
          <span style={{
            background: colors.accent, 
            color: 'white', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '800'
          }}>
            {counts[c] || 0}
          </span>
        </div>
      ))}

      {selectedCat && (
        <>
          <button onClick={() => setSelectedCat(null)} style={{marginBottom: '20px', background: 'none', border: 'none', fontSize: '16px', fontWeight: '700', color: colors.accent}}>← Category zawng zawng</button>
          <h3 style={{fontSize: '20px', fontWeight: '800', marginBottom: '15px'}}>{selectedCat}</h3>
          
          {posts.length === 0 && <p style={{textAlign: 'center', color: 'gray'}}>He category ah hian thawnthu la awm lo</p>}
          
          {posts.map(p => (
            <div key={p.id} style={{background: colors.card, border: `1px solid ${colors.border}`, padding: '18px', marginBottom: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800'}}>{p.title}</h3>
              <p style={{whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0}}>{p.content}</p>
            </div>
          ))}
        </>
      )}

      <BottomNav/>
    </main>
  )
}
