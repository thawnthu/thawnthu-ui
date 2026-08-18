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
    if(!title ||!content) return alert('Kim lo')
    setLoading(true)
    await addDoc(collection(db, "thawnthu"), {
      title, content, category, createdAt: serverTimestamp()
    })
    alert('Dah a hlawhtling!')
    setTitle(''); setContent('')
    setLoading(false)
  }

  return (
    <main style={{padding: '20px', paddingBottom: '70px'}}>
      <h2>Thawnthu Thar Dah</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px'}}/>
      <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} style={{width: '100%', padding: '12px', marginBottom: '10px'}}/>
      
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '15px'}}>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>

      <button onClick={handlePost} disabled={loading} style={{padding: '12px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '6px'}}>
        {loading? 'Dah mek...' : 'Post'}
      </button>
      <BottomNav/>
    </main>
  )
}
