'use client';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "posts"), s => setPosts(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    const unsub2 = onSnapshot(collection(db, "users"), s => setUsers(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    const unsub3 = onSnapshot(collection(db, "groups"), s => setGroups(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    return ()=>{unsub1(); unsub2(); unsub3();};
  }, []);

  const filter = (text: string) => text?.toLowerCase().includes(q.toLowerCase());
  const filteredPosts = q? posts.filter(p => filter(p.title) || filter(p.content) || filter(p.category)) : [];
  const filteredUsers = q? users.filter(u => filter(u.name) || filter(u.email)) : [];
  const filteredGroups = q? groups.filter(g => filter(g.name)) : [];

  return (
    <div style={{padding: '12px', minHeight: '100vh', background: '#fff'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', borderRadius: '12px', padding: '10px 14px'}}>
        <Search size={18} color="#888"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts, users, groups..." style={{flex:1, border:'none', background:'none', outline:'none', fontSize:'15px'}} autoFocus/>
        {q && <button onClick={()=>setQ('')} style={{border:'none', background:'#ddd', width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><X size={14}/></button>}
      </div>

      {!q && <p style={{textAlign:'center', color:'#888', marginTop:'30px'}}>🔍 Type to search...</p>}

      {q && (
        <div style={{marginTop:'16px', display:'flex', flexDirection:'column', gap:'16px'}}>
          {filteredUsers.length>0 && (
            <div><h3 style={{fontWeight:800, marginBottom:'8px'}}>Users ({filteredUsers.length})</h3>
              {filteredUsers.slice(0,5).map(u=>(
                <div key={u.id} onClick={()=>router.push(`/profile/${u.id}`)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#f9f9f9', borderRadius:'10px', marginBottom:'6px', cursor:'pointer'}}>
                  <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{u.name?.[0]}</div>
                  <div><div style={{fontWeight:700, fontSize:'14px'}}>{u.name}</div><div style={{fontSize:'12px', color:'#888'}}>{u.email}</div></div>
                </div>
              ))}
            </div>
          )}
          {filteredPosts.length>0 && (
            <div><h3 style={{fontWeight:800, marginBottom:'8px'}}>Posts ({filteredPosts.length})</h3>
              {filteredPosts.slice(0,10).map(p=>(
                <div key={p.id} onClick={()=>router.push(`/home`)} style={{padding:'10px', background:'#f9f9f9', borderRadius:'10px', marginBottom:'6px', cursor:'pointer'}}>
                  <div style={{fontWeight:700, fontSize:'14px'}}>{p.title || p.content?.slice(0,40)}</div>
                  <div style={{fontSize:'12px', color:'#888'}}>{p.category} • {p.content?.slice(0,60)}</div>
                </div>
              ))}
            </div>
          )}
          {filteredGroups.length>0 && (
            <div><h3 style={{fontWeight:800, marginBottom:'8px'}}>Groups ({filteredGroups.length})</h3>
              {filteredGroups.map(g=>(
                <div key={g.id} onClick={()=>router.push(`/group/${g.id}`)} style={{padding:'10px', background:'#f3e8ff', borderRadius:'10px', marginBottom:'6px', cursor:'pointer', fontWeight:700}}>{g.name}</div>
              ))}
            </div>
          )}
          {filteredUsers.length===0 && filteredPosts.length===0 && filteredGroups.length===0 && <p style={{textAlign:'center', color:'#888'}}>No result for "{q}"</p>}
        </div>
      )}
    </div>
  );
}
