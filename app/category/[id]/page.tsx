'use client';
import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoryDetail() {
  const params = useParams();
  const categoryId = params.id as string;
  const [subs, setSubs] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    // Sub category la
    const q1 = query(collection(db, "categories"), where("parentId", "==", categoryId));
    getDocs(q1).then(snap => setSubs(snap.docs.map(d => ({id: d.id,...d.data()}))));

    // Post la - subCategoryId awm lo ho
    const q2 = query(collection(db, "posts"), where("categoryId", "==", categoryId), where("subCategoryId", "==", null));
    getDocs(q2).then(snap => setPosts(snap.docs.map(d => ({id: d.id,...d.data()}))));
  }, [categoryId]);

  const createSub = async () => {
    await addDoc(collection(db, "categories"), {name: newSubName, parentId: categoryId});
    setShowSubModal(false);
    setNewSubName('');
    // reload
  }

  return (
    <div>
      <div style={{padding: '16px', display: 'flex', gap: '8px'}}>
        <button onClick={()=>setShowSubModal(true)}>+ Create Sub Category</button>
        <Link href={`/post?cat=${categoryId}`}><button>+ Create Post</button></Link>
      </div>

      {/* SUB CATEGORY LIST */}
      {subs.map(s => (
        <Link href={`/category/${categoryId}/${s.id}`}>
          <div>{s.name}</div>
        </Link>
      ))}

      {/* POST LIST - SUB AWM LOH CHUAN HEMI AH */}
      {posts.map(p => <div>{p.title}</div>)}

      {/* SUB CREATE MODAL */}
      {showSubModal && (
        <div>
          <input value={newSubName} onChange={(e)=>setNewSubName(e.target.value)} placeholder="Sub Category hming"/>
          <button onClick={createSub}>Create</button>
        </div>
      )}
    </div>
  )
}
