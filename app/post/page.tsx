'use client';
import { useState } from 'react';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Love Story', 'Sual lam', 'Nula palai', 'General'];

export default function PostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dark, setDark] = useState(true);
  const [accent] = useState('#5865F2');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title ||!content) return alert("Title leh Thu kim lo");
    setSubmitting(true);
    await addDoc(collection(db, "posts"), {
      title, content, category,
      author: author || "Anonymous",
      status: "approved",
      createdAt: Timestamp.now(),
    });
    alert("I thu i thehlut e! A lang nghal e");
    setTitle(""); setContent(""); setAuthor("");
    setSubmitting(false);
  };

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{padding: '16px', borderBottom: `1px solid ${border}`}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thu Thehlut</h1>
      </div>
      <form onSubmit={handleSubmit} style={{padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px'}}>
        <input placeholder="I Hming" value={author} onChange={e=>setAuthor(e.target.value)} style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}/>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Thawnthu Hming" value={title} onChange={e=>setTitle(e.target.value)} style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}/>
        <textarea placeholder="I thu ziak rawh..." value={content} onChange={e=>setContent(e.target.value)} rows={10} style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}/>
        <button type="submit" disabled={submitting} style={{width: '100%', padding: "14px", background: accent, color: "white", border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer'}}>
          {submitting? "Thehluh mek..." : "Thehlut"}
        </button>
      </form>
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/post" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>✍️</span>Post</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🔔</span>Notify</button></Link>
      </div>
    </div>
  )
}
