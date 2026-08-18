'use client'
import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
  const [thawnthu, setThawnthu] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  // Thawnthu lak
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const q = query(collection(db, "thawnthu"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({id: doc.id,...doc.data()}))
    setThawnthu(data)
  }

  // Thawnthu dah
  const handlePost = async () => {
    if(!title ||!content) return alert('Title leh Thawnthu dah rawh')
    setLoading(true)
    try {
      await addDoc(collection(db, "thawnthu"), {
        title: title,
        content: content,
        createdAt: serverTimestamp()
      })
      setTitle('')
      setContent('')
      alert('Thawnthu dah a hlawhtling!')
      fetchData() // Refresh
    } catch (err) {
      alert('Error: ' + err)
    }
    setLoading(false)
  }

  return (
    <main style={{maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif'}}>
      
      {/* POST FORM */}
      <div style={{border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '40px'}}>
        <h2>Thawnthu Thar Dah</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box'}}/>
        <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} style={{width: '100%', padding: '12px', marginBottom: '15px', boxSizing: 'border-box'}}/>
        <button onClick={handlePost} disabled={loading} style={{padding: '12px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '6px'}}>
          {loading? 'Dah mek...' : 'Post'}
        </button>
      </div>

      {/* THAWNTHU LIST */}
      <h1>Thawnthu Zawng Zawng</h1>
      {thawnthu.length === 0 && <p>Thawnthu la awm lo</p>}
      {thawnthu.map((t) => (
        <div key={t.id} style={{border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px'}}>
          <h2>{t.title}</h2>
          <p style={{whiteSpace: 'pre-line'}}>{t.content}</p>
        </div>
      ))}
    </main>
  )
}
