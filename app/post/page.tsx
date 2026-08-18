'use client'
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Post() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePost = async () => {
    if(!title || !content) return alert('Title leh Thawnthu dah rawh')
    setLoading(true)
    try {
      await addDoc(collection(db, "thawnthu"), {
        title: title,
        content: content,
        author: auth.currentUser?.email || "Anonymous",
        createdAt: serverTimestamp()
      })
      alert('Thawnthu dah a hlawhtling!')
      router.push('/') // Home page ah a let leh ang
    } catch (err) {
      alert('A hlawhtling lo')
    }
    setLoading(false)
  }

  return (
    <main style={{maxWidth: '700px', margin: '50px auto', padding: '20px'}}>
      <h1>Thawnthu Post Na</h1>
      <input 
        type="text" 
        placeholder="Thawnthu Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{width: '100%', padding: '12px', marginBottom: '10px', fontSize: '18px'}}
      />
      <textarea
        placeholder="I thawnthu ziak rawh..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={15}
        style={{width: '100%', padding: '12px', marginBottom: '15px', fontSize: '16px'}}
      />
      <button 
        onClick={handlePost}
        disabled={loading}
        style={{padding: '12px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px'}}
      >
        {loading ? 'Dah mek...' : 'Post'}
      </button>
    </main>
  )
}
