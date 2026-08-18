'use client'
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Thu Tha', 'Chanchin', 'Hla']

export default function PostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Pasaltha')
  const [loading, setLoading] = useState(false)

  const handlePost = async () => {
    if(!title ||!content) return alert('Title leh Thawnthu dah rawh')
    setLoading(true)
    await addDoc(collection(db, "thawnthu"), {
      title, content, category, createdAt: serverTimestamp()
    })
    alert('Thawnthu dah a hlawhtling!')
    setTitle(''); setContent('')
    setLoading(false)
  }

  return (
    <main style={{padding: '20px', paddingBottom: '80px', background: '#f8f9fa', minHeight: '100vh'}}>
      <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '20px'}}>Thawnthu Thar Dah</h2>
      <div style={{background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width: '100%', padding: '14px', marginBottom: '12px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', fontWeight: '600'}}/>
        <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} style={{width: '100%', padding: '14px', marginBottom: '12px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit'}}/>
        
        <label style={{fontWeight: '700', marginBottom: '8px', display: 'block'}}>Category thlang rawh</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{width: '100%', padding: '14px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', fontWeight: '600'}}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={handlePost} disabled={loading} style={{width: '100%', padding: '16px', background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800'}}>
          {loading? 'Dah mek...' : 'Post'}
        </button>
      </div>
      <BottomNav/>
    </main>
  )
}
