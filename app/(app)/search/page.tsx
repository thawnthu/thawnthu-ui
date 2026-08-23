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
    <div style={{minHeight: 'calc(100vh - 52px)', background: '#f5f5f5', display:'flex', flexDirection:'column'}}>
      {/* FIX - full width, a te tawh lo - a lian tawh */}
      <div style={{
        position: 'fixed',
        top: '52px',
        left: '0',
        right: '0',
        zIndex: 15,
        background: '#f5f5f5',
        padding: '12px 14px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '28px',
          padding: '15px 18px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          border: '1px solid #eeeeee',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Search size={20} color="#999" strokeWidth={2.5} style={{flexShrink:0}}/>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search Chat, User, Group..."
            style={{flex:1, border:'none', background:'none', outline:'none', fontSize:'16px', fontWeight:500, color:'#333', width:'100%'}}
            autoFocus
          />
          {q && (
            <button onClick={()=>setQ('')} style={{border:'none', background:'#eee', width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
              <X size={14} color="#666"/>
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      <div style={{flex:1, overflowY:'auto', padding: '72px 14px 14px 14px'}}>
        {!q && <p style={{textAlign:'center', color:'#aaa', marginTop:'80px', fontSize:'15px'}}>Search all site...</p>}

        {q && (
          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
            {filteredUsers.length>0 && filteredUsers.slice(0,8).map(u=>(
              <div key={u.id} onClick={()=>router.push(`/profile/${u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'18px'}}>{u.name?.[0]?.toUpperCase() || 'U'}</div>
                <div style={{flex:1}}><div style={{fontWeight:700, fontSize:'15px'}}>{u.name}</div><div style={{fontSize:'12px', color:'#888'}}>{u.email}</div></div>
              </div>
            ))}
            {filteredPosts.length>0 && filteredPosts.slice(0,10).map(p=>(
              <div key={p.id} onClick={()=>router.push(`/home`)} style={{padding:'12px 14px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight:700, fontSize:'14px'}}>{p.title || p.content?.slice(0,50)}</div>
                <div style={{fontSize:'12px', color:'#888'}}>{p.category} • {p.content?.slice(0,60)}</div>
              </div>
            ))}
            {filteredGroups.length>0 && filteredGroups.map(g=>(
              <div key={g.id} onClick={()=>router.push(`/group/${g.id}`)} style={{padding:'12px 14px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', fontWeight:700, fontSize:'14px'}}>{g.name}</div>
            ))}
            {filteredUsers.length===0 && filteredPosts.length===0 && filteredGroups.length===0 && <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>No result for "{q}"</p>}
          </div>
        )}
      </div>
    </div>
  );
                             }
