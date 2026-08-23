'use client';
import { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'chat'|'status'|'online'>('chat');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [currentUid, setCurrentUid] = useState('');
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u)=>{
      if(u) setCurrentUid(u.uid);
    });
    return ()=>unsubAuth();
  }, []);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), s => {
      const list = s.docs.map(d=>({id:d.id,...d.data()} as any));
      setUsers(list);
      const map: Record<string, any> = {};
      list.forEach(u=>{ map[u.id]=u; if(u.uid) map[u.uid]=u; });
      setUsersMap(map);
    });
    const unsubChats = onSnapshot(collection(db, "chats"), s => {
      setChats(s.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
    return ()=>{unsubUsers(); unsubChats();};
  }, []);

  const getPic = (u:any) => u?.profilePic || u?.photoURL || u?.image || u?.avatar || u?.pic || '';

  const myChats = chats.filter(c =>
    c.participants?.includes(currentUid) || c.users?.includes(currentUid) || c.members?.includes(currentUid)
  ).sort((a,b)=> (b.lastMessageAt?.seconds||b.updatedAt?.seconds||0) - (a.lastMessageAt?.seconds||a.updatedAt?.seconds||0));

  const otherUsers = users.filter(u => u.id!== currentUid && (u.uid||u.id)!== currentUid);
  const onlineUsers = otherUsers.filter(u => u.online === true);
  const filteredOther = otherUsers.filter(u =>
    (u.name||'').toLowerCase().includes(search.toLowerCase()) || (u.email||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{minHeight:'calc(100vh - 52px)', background:'#f5f5f5', display:'flex', flexDirection:'column'}}>
      {/* TAB HEADER - header hnuaiah ding reng - fixed */}
      <div style={{
        position:'fixed',
        top:'52px',
        left:0,
        right:0,
        zIndex:19,
        background:'#fff',
        display:'flex',
        borderBottom:'1px solid #e5e7eb',
        height:'48px',
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)'
      }}>
        {[
          {key:'chat', label:'Chat', count: myChats.length || otherUsers.length},
          {key:'status', label:'Status', count: otherUsers.length},
          {key:'online', label:'Online', count: onlineUsers.length},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)} style={{
            flex:1,
            border:'none',
            background:'none',
            fontSize:'15px',
            fontWeight: tab===t.key? '800':'600',
            color: tab===t.key? '#8d31ce':'#666',
            borderBottom: tab===t.key? '3px solid #8d31ce':'3px solid transparent',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:'6px'
          }}>
            {t.label}
            <span style={{
              background: tab===t.key? '#8d31ce':'#e5e7eb',
              color: tab===t.key? '#fff':'#666',
              borderRadius:'10px',
              padding:'1px 6px',
              fontSize:'11px',
              fontWeight:'700'
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{paddingTop:'60px', flex:1, overflowY:'auto'}}>
        {/* CHAT TAB */}
        {tab==='chat' && (
          <div style={{padding:'10px 10px 0 10px'}}>
            <div style={{
              display:'flex',
              alignItems:'center',
              gap:'10px',
              background:'#fff',
              borderRadius:'28px',
              padding:'13px 16px',
              boxShadow:'0 2px 10px rgba(0,0,0,0.08)',
              marginBottom:'10px'
            }}>
              <Search size={20} color="#999" strokeWidth={2.5}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chat..." style={{flex:1, border:'none', outline:'none', fontSize:'15px', background:'none'}}/>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'1px'}}>
              {/* Chats awm chuan chat list, awm loh chuan users list ang in */}
              {(myChats.length>0? myChats : filteredOther).map((item:any, idx:number)=>{
                const isChatDoc =!!item.participants;
                const otherId = isChatDoc? (item.participants?.find((id:string)=>id!==currentUid) || item.users?.find((id:string)=>id!==currentUid)) : item.id;
                const user = isChatDoc? (usersMap[otherId] || {}) : item;
                const pic = getPic(user) || getPic(item);
                const name = user.name || user.displayName || item.name || 'Unknown';
                const lastMsg = item.lastMessage || item.lastMessageText || user.email || 'Hiii';
                const time = item.lastMessageAt? new Date(item.lastMessageAt.seconds*1000).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) : '10:19 am';

                return (
                  <div key={item.id||idx} onClick={()=>router.push(`/chat/${otherId || user.uid || user.id}`)} style={{
                    display:'flex',
                    alignItems:'center',
                    gap:'12px',
                    padding:'12px 12px',
                    background:'#fff',
                    borderRadius: idx===0? '16px 16px 4px 4px':'4px',
                    cursor:'pointer',
                  }}>
                    <div style={{position:'relative'}}>
                      {pic? <img src={pic} alt={name} style={{width:'52px', height:'52px', borderRadius:'50%', objectFit:'cover', border:'2px solid #f0f0f0'}}/> : <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'20px'}}>{name[0]?.toUpperCase()}</div>}
                      {user.online && <div style={{position:'absolute', bottom:'2px', right:'2px', width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{fontWeight:700, fontSize:'16px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{name}</div>
                        <div style={{fontSize:'12px', color:'#888', flexShrink:0, marginLeft:'8px'}}>{time}</div>
                      </div>
                      <div style={{fontSize:'14px', color:'#666', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'2px'}}>{lastMsg}</div>
                    </div>
                    <MoreVertical size={18} color="#aaa"/>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATUS TAB - Friends ho Status */}
        {tab==='status' && (
          <div style={{padding:'12px'}}>
            <div style={{background:'#fff', borderRadius:'16px', padding:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:800, fontSize:'14px', marginBottom:'12px', color:'#333'}}>Recent updates</div>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {filteredOther.map(u=>{
                  const pic = getPic(u);
                  return (
                    <div key={u.id} onClick={()=>router.push(`/status/${u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', cursor:'pointer'}}>
                      <div style={{width:'56px', height:'56px', borderRadius:'50%', padding:'3px', background:'linear-gradient(45deg, #f59e0b, #8d31ce, #ec4899)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#fff', padding:'2px'}}>
                          {pic? <img src={pic} alt="" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{u.name?.[0]}</div>}
                        </div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, fontSize:'15px'}}>{u.name || u.displayName}</div>
                        <div style={{fontSize:'12px', color:'#888'}}>Today, {new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ONLINE TAB - Friends ho online */}
        {tab==='online' && (
          <div style={{padding:'12px'}}>
            <div style={{background:'#fff', borderRadius:'16px', padding:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:800, fontSize:'14px', marginBottom:'12px', color:'#22c55e'}}>● Online - {onlineUsers.length}</div>
              <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                {onlineUsers.length===0 && <p style={{textAlign:'center', color:'#888', padding:'20px'}}>No friends online</p>}
                {onlineUsers.filter(u=> (u.name||'').toLowerCase().includes(search.toLowerCase())).map(u=>{
                  const pic = getPic(u);
                  return (
                    <div key={u.id} onClick={()=>router.push(`/chat/${u.uid || u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderRadius:'12px', cursor:'pointer', background:'#f9fafb'}}>
                      <div style={{position:'relative'}}>
                        {pic? <img src={pic} alt="" style={{width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover'}}/> : <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'#8d31ce', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800}}>{u.name?.[0]}</div>}
                        <div style={{position:'absolute', bottom:0, right:0, width:'14px', height:'14px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, fontSize:'15px'}}>{u.name || u.displayName}</div>
                        <div style={{fontSize:'12px', color:'#22c55e', fontWeight:600}}>Active now</div>
                      </div>
                      <div style={{width:'10px', height:'10px', background:'#22c55e', borderRadius:'50%'}}></div>
                    </div>
                  );
                })}
                {onlineUsers.length>0 && <div style={{height:'1px', background:'#eee', margin:'12px 0'}}></div>}
                <div style={{fontWeight:700, fontSize:'13px', color:'#888', marginBottom:'8px'}}>All Friends</div>
                {filteredOther.map(u=>{
                  const pic = getPic(u);
                  return (
                    <div key={u.id} onClick={()=>router.push(`/chat/${u.uid || u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'8px', opacity: u.online? 1:0.6}}>
                      <div style={{position:'relative'}}>
                        {pic? <img src={pic} alt="" style={{width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover'}}/> : <div style={{width:'42px', height:'42px', borderRadius:'50%', background:'#ddd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{u.name?.[0]}</div>}
                        {u.online && <div style={{position:'absolute', bottom:0, right:0, width:'10px', height:'10px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>}
                      </div>
                      <div style={{fontSize:'14px', fontWeight:600}}>{u.name}</div>
                      <div style={{marginLeft:'auto', fontSize:'11px', color: u.online? '#22c55e':'#888'}}>{u.online? 'Online':'Offline'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
                      }
