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
      {/* Chat search ang chiah - pill shape nalh */}
      <div style={{position: 'sticky', top: '0px', zIndex: 10, background: '#f5f5f5', padding: '12px'}}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '28px',
          padding: '14px 18px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <Search size={20} color="#888" strokeWidth={2.2}/>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search chat..."
            style={{flex:1, border:'none', background:'none', outline:'none', fontSize:'16px', fontWeight:500, color:'#333'}}
            autoFocus
          />
          {q && (
            <button onClick={()=>setQ('')} style={{border:'none', background:'#eee', width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
              <X size={14} color="#666"/>
            </button>
          )}
        </div>
      </div>

      {/* Results - tawlh thei */}
      <div style={{flex:1, overflowY:'auto', padding: '0 12px 12px 12px'}}>
        {!q && <p style={{textAlign:'center', color:'#aaa', marginTop:'50px', fontSize:'15px'}}>Search all site...</p>}

        {q && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'4px'}}>
            {filteredUsers.length>0 && (
              <div>
                {filteredUsers.slice(0,8).map(u=>(
                  <div key={u.id} onClick={()=>router.push(`/profile/${u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#fff', borderRadius:'16px', marginBottom:'8px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                    <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'18px'}}>{u.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700, fontSize:'15px', display:'flex', justifyContent:'space-between'}}>
                        <span>{u.name}</span>
                        <span style={{fontSize:'12px', color:'#888', fontWeight:400}}>{u.online? 'Online' : ''}</span>
                      </div>
                      <div style={{fontSize:'13px', color:'#888'}}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredPosts.length>0 && (
              <div>
                {filteredPosts.slice(0,10).map(p=>(
                  <div key={p.id} onClick={()=>router.push(`/home`)} style={{padding:'12px 14px', background:'#fff', borderRadius:'16px', marginBottom:'8px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                    <div style={{fontWeight:700, fontSize:'14px', marginBottom:'2px'}}>{p.title || p.content?.slice(0,50)}</div>
                    <div style={{fontSize:'12px', color:'#888'}}>{p.category} • {p.content?.slice(0,60)}</div>
                  </div>
                ))}
              </div>
            )}
            {filteredGroups.length>0 && (
              <div>
                {filteredGroups.map(g=>(
                  <div key={g.id} onClick={()=>router.push(`/group/${g.id}`)} style={{padding:'12px 14px', background:'#fff', borderRadius:'16px', marginBottom:'8px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', fontWeight:700, fontSize:'14px'}}>{g.name}</div>
                ))}
              </div>
            )}
            {filteredUsers.length===0 && filteredPosts.length===0 && filteredGroups.length===0 && (
              <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>No result for "{q}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
