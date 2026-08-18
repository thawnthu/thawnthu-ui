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
    <main style={{padding: '20px', paddingBottom: '70px'}}>
      <h2>Thawnthu Thar Dah</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box'}}/>
      <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} style={{width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box'}}/>
      
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '15px', boxSizing: 'border-box'}}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button onClick={handlePost} disabled={loading} style={{width: '100%', padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px'}}>
        {loading? 'Dah mek...' : 'Post'}
      </button>
      <BottomNav/>
    </main>
  )
}
