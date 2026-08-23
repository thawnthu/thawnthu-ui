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
    <div style={{minHeight: 'calc(100vh - 50px)', background: '#f5f5f5', display:'flex', flexDirection:'column'}}>
      {/* 2 & 4 - Search na header hnuaiah ding reng + class nalh */}
      <div style={{position: 'sticky', top: '0px', zIndex: 10, background: '#fff', padding: '10px 12px', borderBottom: '1px solid #eee'}}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f3f4f6',
          borderRadius: '14px',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <Search size={20} color="#8d31ce" strokeWidth={2.5}/>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search posts, users, groups..."
            style={{flex:1, border:'none', background:'none', outline:'none', fontSize:'15px', fontWeight:600}}
            autoFocus
          />
          {q && <button onClick={()=>setQ('')} style={{border:'none', background:'#8d31ce', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><X size={14} color="#fff"/></button>}
        </div>
      </div>

      {/* Thil search chhuah chauh tawlh thei */}
      <div style={{flex:1, overflowY:'auto', padding: '12px'}}>
        {!q && <p style={{textAlign:'center', color:'#888', marginTop:'40px', fontSize:'15px'}}>🔍 Type to search...</p>}

        {q && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {filteredUsers.length>0 && (
              <div style={{background:'#fff', borderRadius:'14px', padding:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontWeight:800, marginBottom:'8px', fontSize:'14px'}}>Users ({filteredUsers.length})</h3>
                {filteredUsers.slice(0,5).map(u=>(
                  <div key={u.id} onClick={()=>router.push(`/profile/${u.id}`)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#f9f9f9', borderRadius:'10px', marginBottom:'6px', cursor:'pointer'}}>
                    <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{u.name?.[0]}</div>
                    <div><div style={{fontWeight:700, fontSize:'14px'}}>{u.name}</div><div style={{fontSize:'12px', color:'#888'}}>{u.email}</div></div>
                  </div>
                ))}
              </div>
            )}
            {filteredPosts.length>0 && (
              <div style={{background:'#fff', borderRadius:'14px', padding:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontWeight:800, marginBottom:'8px', fontSize:'14px'}}>Posts ({filteredPosts.length})</h3>
                {filteredPosts.slice(0,10).map(p=>(
                  <div key={p.id} onClick={()=>router.push(`/home`)} style={{padding:'10px', background:'#f9f9f9', borderRadius:'10px', marginBottom:'6px', cursor:'pointer'}}>
                    <div style={{fontWeight:700, fontSize:'14px'}}>{p.title || p.content?.slice(0,40)}</div>
                    <div style={{fontSize:'12px', color:'#888'}}>{p.category} • {p.content?.slice(0,60)}</div>
                  </div>
                ))}
              </div>
            )}
            {filteredGroups.length>0 && (
              <div style={{background:'#fff', borderRadius:'14px', padding:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontWeight:800, marginBottom:'8px', fontSize:'14px'}}>Groups ({filteredGroups.length})</h3>
                {filteredGroups.map(g=>(
                  <div key={g.id} onClick={()=>router.push(`/group/${g.id}`)} style={{padding:'10px', background:'#f3e8ff', borderRadius:'10px', marginBottom:'6px', cursor:'pointer', fontWeight:700}}>{g.name}</div>
                ))}
              </div>
            )}
            {filteredUsers.length===0 && filteredPosts.length===0 && filteredGroups.length===0 && <p style={{textAlign:'center', color:'#888'}}>No result for "{q}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}
