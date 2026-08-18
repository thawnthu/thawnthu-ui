'use client'
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePost = async () => {
    if(!title || !content) return alert('Title leh Thawnthu dah rawh')
    if(!auth.currentUser) return alert('Login hmasa rawh')
    
    setLoading(true)
    try {
      await addDoc(collection(db, "thawnthu"), {
        title: title,
        content: content,
        author: auth.currentUser.email,
        createdAt: serverTimestamp()
      })
      alert('Thawnthu dah a hlawhtling!')
      router.push('/')
    } catch (err) {
      alert('Error: ' + err)
    }
    setLoading(false)
  }

  return (
    <main style={{maxWidth: '700px', margin: '50px auto', padding: '20px'}}>
      <h1>Thawnthu Post Na</h1>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px'}}/>
      <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e) => setContent(e.target.value)} rows={15} style={{width: '100%', padding: '12px', marginBottom: '15px'}}/>
      <button onClick={handlePost} disabled={loading} style={{padding: '12px 30px', background: 'black', color: 'white', border: 'none'}}>
        {loading ? 'Dah mek...' : 'Post'}
      </button>
    </main>
  )
      }
