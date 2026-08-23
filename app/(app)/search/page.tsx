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
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "posts"), s => setPosts(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    const unsub2 = onSnapshot(collection(db, "users"), s => {
      const list = s.docs.map(d=>({id:d.id,...d.data()} as any));
      setUsers(list);
      const map: Record<string, any> = {};
      list.forEach(u=>{ map[u.id]=u; if(u.uid) map[u.uid]=u; });
      setUsersMap(map);
    });
    const unsub3 = onSnapshot(collection(db, "groups"), s => setGroups(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    return ()=>{unsub1(); unsub2(); unsub3();};
  }, []);

  const getPic = (u:any) => u?.profilePic || u?.photoURL || u?.image || u?.avatar || u?.pic || '';

  const filter = (text: string) => text?.toLowerCase().includes(q.toLowerCase());
  const filteredPosts = q? posts.filter(p => filter(p.title) || filter(p.content) || filter(p.category) || filter(p.authorName)) : [];
  const filteredUsers = q? users.filter(u => filter(u.name) || filter(u.email) || filter(u.displayName)) : [];
  const filteredGroups = q? groups.filter(g => filter(g.name)) : [];

  // FIX - click a kal theih nan
  const handleUserClick = (u:any) => {
    const uid = u.uid || u.id;
    // Profile ah kal - i app ah /profile/[id] leh /users/[id] pahnih a awm thei
    router.push(`/profile/${uid}`);
  };

  const handlePostClick = (p:any) => {
    // Post ah kal - home ah postId query nen
    localStorage.setItem('scrollToPost', p.id);
    router.push(`/home?post=${p.id}#${p.id}`);
  };

  const handleGroupClick = (g:any) => {
    router.push(`/group/${g.id}`);
  };

  const handleChatClick = (u:any) => {
    const uid = u.uid || u.id;
    router.push(`/chat/${uid}`);
  };

  return (
    <div style={{minHeight: 'calc(100vh - 52px)', background: '#f5f5f5', display:'flex', flexDirection:'column'}}>
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

      <div style={{flex:1, overflowY:'auto', padding: '72px 14px 14px 14px'}}>
        {!q && <p style={{textAlign:'center', color:'#aaa', marginTop:'80px', fontSize:'15px'}}>Search all site...</p>}

        {q && (
          <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'8px'}}>
            {filteredUsers.length>0 && filteredUsers.slice(0,10).map(u=>{
              const pic = getPic(u);
              return (
                <div key={u.id} onClick={()=>handleUserClick(u)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0'}}>
                  {pic? (
                    <img src={pic} alt={u.name} style={{width:'46px', height:'46px', borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #f0f0f0'}}/>
                  ) : (
                    <div style={{width:'46px', height:'46px', borderRadius:'50%', background:'#8d31ce', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'18px', flexShrink:0}}>{u.name?.[0]?.toUpperCase() || 'U'}</div>
                  )}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:'15px'}}>{u.name || u.displayName}</div>
                    <div style={{fontSize:'12px', color:'#888'}}>{u.email} • Tap to view profile</div>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length>0 && filteredPosts.slice(0,10).map(p=>{
              const author = usersMap[p.authorId || p.uid || p.userId] || {};
              const pic = getPic(author) || getPic(p);
              return (
                <div key={p.id} onClick={()=>handlePostClick(p)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0'}}>
                  {pic? (
                    <img src={pic} alt="" style={{width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', flexShrink:0}}/>
                  ) : (
                    <div style={{width:'42px', height:'42px', borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, flexShrink:0}}>P</div>
                  )}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.title || p.content?.slice(0,50)}</div>
                    <div style={{fontSize:'12px', color:'#888'}}>{p.category} • {p.content?.slice(0,60)} • Tap to view post</div>
                  </div>
                </div>
              );
            })}

            {filteredGroups.length>0 && filteredGroups.map(g=>{
              const pic = getPic(g);
              return (
                <div key={g.id} onClick={()=>handleGroupClick(g)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'#fff', borderRadius:'16px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0'}}>
                  {pic? <img src={pic} alt="" style={{width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', flexShrink:0}}/> : <div style={{width:'42px', height:'42px', borderRadius:'50%', background:'#f3e8ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, flexShrink:0}}>G</div>}
                  <div style={{fontWeight:700, fontSize:'14px'}}>{g.name} • Tap to view group</div>
                </div>
              );
            })}

            {filteredUsers.length===0 && filteredPosts.length===0 && filteredGroups.length===0 && <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>No result for "{q}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}
