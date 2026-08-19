'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Love Story', 'Sual lam', 'Nula palai', 'General'];

export default function CategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const snapshot = await getDocs(collection(db, "posts"));
      const posts = snapshot.docs.map(doc => doc.data());
      const data = CATEGORIES.map(name => ({
        name,
        count: posts.filter((p: any) => p.category === name).length
      }));
      setCategories(data);
    };
    fetchCounts();
  }, []);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{padding: '16px', borderBottom: `1px solid ${border}`}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Category</h1>
      </div>
      <div style={{padding: '12px', paddingBottom: '80px'}}>
        {categories.map((c,i)=>(
          <div key={i} style={{background: card, margin: '10px 0', padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '16px', fontWeight: '700'}}>{c.name}</span>
            <span style={{fontSize: '14px', color: subtext}}>{c.count} posts</span>
          </div>
        ))}
      </div>
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/post" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>✍️</span>Post</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🔔</span>Notify</button></Link>
      </div>
    </div>
  )
}
