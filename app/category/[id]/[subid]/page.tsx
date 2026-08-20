'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

type Category = { id: string; name: string; parentId: string }

export default function SubCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const subId = params.subId as string;

  const [subCat, setSubCat] = useState<Category | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [dark] = useState(false);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  useEffect(() => {
    fetchData();
  }, [subId]);

  const fetchData = async () => {
    // 1. SUB CATEGORY HMING LA
    const subDoc = await getDoc(doc(db, "categories", subId));
    if(subDoc.exists()) setSubCat({id: subDoc.id,...subDoc.data()} as Category);

    // 2. HE SUB AH HIAN POST LA
    const q = query(collection(db, "posts"), where("subCategoryId", "==", subId));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({id: d.id,...d.data()})));
  }

  if(!subCat) return <div style={{padding: '20px'}}>Loading...</div>

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>
      {/* HEADER */}
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <button onClick={()=>router.back()} style={{background: 'none', border: 'none', fontSize: '20px'}}>←</button>
        <h2 style={{margin: 0}}>{subCat.name}</h2>
      </div>

      {/* CREATE POST BUTTON CHIAH */}
      <div style={{padding: '0 16px', marginBottom: '16px'}}>
        <Link href={`/post?cat=${categoryId}&sub=${subId}`} style={{textDecoration: 'none'}}>
          <button style={{width: '100%', background: accent, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700'}}>+ Create Post</button>
        </Link>
      </div>

      {/* POST LIST */}
      <div style={{padding: '0 16px'}}>
        {posts.length === 0 && <p>He sub category ah hian post ala awm lo</p>}
        {posts.map(p => (
          <div key={p.id} style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, marginBottom: '10px'}}>
            <h4 style={{margin: 0}}>{p.title}</h4>
            <p>{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
