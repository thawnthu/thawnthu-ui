'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GlobalSearchPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({id: d.id,...d.data()})));
    });
    const unsubPosts = onSnapshot(collection(db, "posts"), snap => {
      setPosts(snap.docs.map(d => ({id: d.id,...d.data()})));
    });
    const unsubChats = onSnapshot(collection(db, "chats"), snap => {
      setChats(snap.docs.map(d => ({id: d.id,...d.data()})));
    });
    return () => { unsubUsers(); unsubPosts(); unsubChats(); };
  }, []);

  const lower = q.toLowerCase();
  const filteredUsers = q? users.filter(u => u.name?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower)) : [];
  const filteredPosts = q? posts.filter(p => p.content?.toLowerCase().includes(lower) || p.title?.toLowerCase().includes(lower)) : [];
  const filteredChats = q? chats.filter(c => c.name?.toLowerCase().includes(lower)) : [];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* SEARCH BAR - ding reng */}
      <div style={{ position: 'sticky', top: '120px', zIndex: 15, padding: '10px 12px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px 16px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <button onClick={()=>router.back()} style={{border:'none', background:'none', cursor:'pointer'}}><ArrowLeft size={20} color="#666"/></button>
          <Search size={20} color="#888" />
          <input autoFocus type="text" placeholder="Search posts, users, chats, groups..." value={q} onChange={(e)=>setQ(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!q && <p style={{textAlign:'center', color:'#888', marginTop:'40px'}}>Type to search everything...</p>}

        {filteredUsers.length > 0 && (
          <div style={{background:'#fff', borderRadius:'14px', padding:'12px'}}>
            <h4 style={{margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'6px'}}><User size={16}/> Users ({filteredUsers.length})</h4>
            {filteredUsers.slice(0,5).map(u=>(
              <div key={u.id} onClick={()=>router.push(`/profile/${u.uid||u.id}`)} style={{padding:'8px 0', borderBottom:'1px solid #f0f0f0', cursor:'pointer'}}>{u.name} - {u.email}</div>
            ))}
          </div>
        )}

        {filteredPosts.length > 0 && (
          <div style={{background:'#fff', borderRadius:'14px', padding:'12px'}}>
            <h4 style={{margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'6px'}}><FileText size={16}/> Posts ({filteredPosts.length})</h4>
            {filteredPosts.slice(0,5).map(p=>(
              <div key={p.id} onClick={()=>router.push(`/post/${p.id}`)} style={{padding:'8px 0', borderBottom:'1px solid #f0f0f0', cursor:'pointer'}}>{p.title||p.content?.slice(0,60)}...</div>
            ))}
          </div>
        )}

        {filteredChats.length > 0 && (
          <div style={{background:'#fff', borderRadius:'14px', padding:'12px'}}>
            <h4 style={{margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'6px'}}><MessageCircle size={16}/> Chats & Groups ({filteredChats.length})</h4>
            {filteredChats.slice(0,5).map(c=>(
              <div key={c.id} style={{padding:'8px 0', borderBottom:'1px solid #f0f0f0'}}>{c.name||c.id}</div>
            ))}
          </div>
        )}

        {q && filteredUsers.length===0 && filteredPosts.length===0 && filteredChats.length===0 && (
          <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>No results for "{q}"</p>
        )}
      </div>
    </div>
  );
}
