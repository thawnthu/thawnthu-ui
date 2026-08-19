'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  status: string;
  createdAt: any;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // LOGIN CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/login');
      else setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // PENDING POSTS LAK
  useEffect(() => {
    const fetchPending = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id,...doc.data() })) as Post[];
      setPendingPosts(data.filter(p => p.status === 'pending'));
      setLoading(false);
    };
    if(user) fetchPending();
  }, [user]);

  // APPROVE FUNCTION
  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "posts", id), { status: "approved" });
    setPendingPosts(pendingPosts.filter(p => p.id!== id));
    alert("Approve a ni e");
  };

  // DELETE FUNCTION
  const handleDelete = async (id: string) => {
    if(confirm("Delete i duh tak tak maw?")){
      await deleteDoc(doc(db, "posts", id));
      setPendingPosts(pendingPosts.filter(p => p.id!== id));
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if(!user) return <p>Loading...</p>

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: 'auto', background: '#0f0f10', color: 'white', minHeight: '100vh'}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout} style={{padding: '8px 16px'}}>Logout</button>
      </div>
      <p>Welcome: {user.email}</p>

      <h2 style={{marginTop: '30px'}}>Approve Nghah mek - {pendingPosts.length}</h2>

      {loading? <p>Loading...</p> : 
      pendingPosts.length === 0? <p>Approve tur a awm rih lo</p> :
      pendingPosts.map((p) => (
        <div key={p.id} style={{border: '1px solid #333', padding: '16px', margin: '12px 0', borderRadius: '8px'}}>
          <span style={{background: '#333', padding: '4px 8px', borderRadius: '4px'}}>{p.category}</span>
          <h3>{p.title}</h3>
          <p style={{color: '#aaa'}}>{p.author}</p>
          <p>{p.content.substring(0,200)}...</p>
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button onClick={()=>handleApprove(p.id)} style={{padding: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '4px'}}>✅ Approve</button>
            <button onClick={()=>handleDelete(p.id)} style={{padding: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px'}}>🗑️ Delete</button>
          </div>
        </div>
      ))}

      <hr style={{margin: '40px 0'}}/>
      <h2>Thawnthu Thar Dah</h2>
      {/* I admin post na form hlui kha heta hian dah la */}
    </div>
  )
}
