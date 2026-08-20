'use client';
import { useState, useEffect, Suspense } from 'react'; // Suspense belh
import { useSearchParams, useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import Link from "next/link";

// HEI HI POST FORM CHHUNG TAK
function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dark] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // HEI HI SUSPENSE CHHUNG AH A AWM ANGAI

  const catId = searchParams.get('cat');
  const subId = searchParams.get('sub');

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const subtext = dark? '#a0a0a0' : '#666';

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if(!user) router.push('/login');
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if(!title ||!content) return setError('Title leh Content a ruak thei lo');
    if(!catId) return setError('Category thlan a ngai');

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title: title,
        content: content,
        categoryId: catId,
        subCategoryId: subId || null,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || "Anonymous",
        time: Timestamp.now()
      });

      if(subId) router.push(`/category/${catId}/${subId}`);
      else router.push(`/category/${catId}`);

    } catch (err: any) {
      setError('Post siam a fuh lo: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <button onClick={()=>router.back()} style={{background: 'none', border: 'none', fontSize: '20px'}}>←</button>
        <h2 style={{margin: 0}}>Create Post</h2>
      </div>

      <div style={{padding: '0 16px'}}>
        {error && <p style={{color: 'red', background: '#ffdddd', padding: '10px', borderRadius: '8px'}}>{error}</p>}

        <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`}}>
          <p style={{fontSize: '12px', color: subtext, marginBottom: '16px'}}>
            {subId? "Sub Category ah post i siam" : "Category ah post i siam"}
          </p>

          <input placeholder="Post Title" value={title} onChange={(e)=>setTitle(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, marginBottom: '12px'}}/>
          <textarea placeholder="I thawnthu ziak rawh..." value={content} onChange={(e)=>setContent(e.target.value)} rows={10} style={{width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, marginBottom: '16px'}}/>
          <button onClick={handleSubmit} disabled={loading} style={{width: '100%', background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '800'}}>{loading? 'Posting...' : 'Post Publish'}</button>
        </div>
      </div>

      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/chat" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>💬</span>Chat</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🔔</span>Notify</button></Link>
      </div>
    </div>
  )
}

// HEI HI EXPORT CHHUAHNA TAK
export default function PostPage() {
  return (
    <Suspense fallback={<div style={{padding: '20px'}}>Loading...</div>}>
      <PostForm />
    </Suspense>
  )
}
