'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

type Category = { id: string; name: string; parentId: string | null }

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [dark] = useState(false);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    const q = query(collection(db, "categories"), where("parentId", "==", null));
    const snap = await getDocs(q);
    setCategories(snap.docs.map(d => ({id: d.id,...d.data()})) as Category[]);
  }

  const createCategory = async () => {
    if(!newCatName) return;
    await addDoc(collection(db, "categories"), {name: newCatName, parentId: null});
    setNewCatName('');
    setShowModal(false);
    fetchCats();
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>
      <div style={{padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{fontSize: '24px', fontWeight: '800'}}>Category</h1>
        <button onClick={()=>setShowModal(true)} style={{background: accent, color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}> + Create Category</button>
      </div>

      <div style={{padding: '0 16px 80px 16px'}}>
        {categories.map(cat => (
          <Link href={`/category/${cat.id}`} key={cat.id} style={{textDecoration: 'none'}}>
            <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, marginBottom: '12px'}}>
              <h3 style={{margin: 0, color: text}}>{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* CREATE CATEGORY MODAL */}
      {showModal && (
        <div onClick={()=>setShowModal(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background: card, padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '400px'}}>
            <h3>Create New Category</h3>
            <input value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} placeholder="Category hming" style={{width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, marginBottom: '12px'}}/>
            <div style={{display: 'flex', gap: '8px'}}>
              <button onClick={createCategory} style={{flex: 1, background: accent, color: 'white', border: 'none', padding: '12px', borderRadius: '8px'}}>Create</button>
              <button onClick={()=>setShowModal(false)} style={{flex: 1, background: border, color: text, border: 'none', padding: '12px', borderRadius: '8px'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: '#555', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
      </div>
    </div>
  )
}
