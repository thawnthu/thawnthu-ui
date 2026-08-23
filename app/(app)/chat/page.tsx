'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [activeTab, setActiveTab] = useState<'chats'|'status'|'online'>('chats');
  const [chats, setChats] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});

  useEffect(()=>{ onAuthStateChanged(auth, u=>{ if(u) setCurrentUid(u.uid); }); }, []);

  // Users map load - name pic tan
  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "users"), snap=>{
      const map:any={};
      snap.docs.forEach(d=>{ map[d.id]=d.data(); });
      setUsersMap(map);
      // online filter
      const online = snap.docs.map(d=>({id:d.id,...d.data()} as any)).filter((u:any)=>u.online && u.id!==currentUid);
      setOnlineUsers(online);
    });
    return ()=>unsub();
  }, [currentUid]);

  // Chats load
  useEffect(()=>{
    if(!currentUid) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUid));
    const unsub = onSnapshot(q, snap=>{
      let list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      list = list.sort((a,b)=>{
        const ta = a.lastMessageAt?.seconds||0;
        const tb = b.lastMessageAt?.seconds||0;
        return tb-ta;
      });
      setChats(list);
    });
    return ()=>unsub();
  }, [currentUid]);

  // Status load
  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "statuses"), snap=>{
      setStatuses(snap.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
    return ()=>unsub();
  }, []);

  const getOtherUid = (chat:any) => chat.participants?.find((id:string)=>id!==currentUid);
  const getOtherUser = (chat:any) => usersMap[getOtherUid(chat)] || {};

  return (
    <div style={{height:'100dvh', display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden'}}>

      {/* HEADER - A BO DAWN LO - FIXED */}
      <div style={{background:'#8d31ce', flexShrink:0}}>
        <div style={{height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px'}}>
          <div style={{color:'#fff', fontWeight:800, fontSize:'20px'}}>MzApp</div>
          <div style={{display:'flex', gap:'16px', color:'#fff'}}>🔍 ⋮</div>
        </div>
        {/* TABS - Page hran ni lo, state chauh */}
        <div style={{display:'flex', height:'48px'}}>
          {[
            {id:'chats', label:'CHATS', count: chats.length},
            {id:'status', label:'STATUS', count: statuses.length},
            {id:'online', label:'ONLINE', count: onlineUsers.length},
          ].map((tab:any)=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              flex:1, background:'none', border:'none', color:'#fff', fontWeight: activeTab===tab.id? '700':'400',
              borderBottom: activeTab===tab.id? '3px solid #fff':'3px solid transparent',
              fontSize:'13px', letterSpacing:'0.5px', cursor:'pointer'
            }}>
              {tab.label} {tab.count>0? `(${tab.count})`:''}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1, overflowY:'auto', background:'#fff'}}>

        {/* CHATS TAB */}
        {activeTab==='chats' && (
          <div>
            {chats.length===0 && <div style={{textAlign:'center', padding:'40px', color:'#888'}}>No chats yet</div>}
            {chats.map(chat=>{
              const other = getOtherUser(chat);
              const otherUid = getOtherUid(chat);
              const unread = chat.unreadCount?.[currentUid]||0;
              return (
                <div key={chat.id} onClick={()=>router.push(`/chat/${otherUid}`)} style={{display:'flex', gap:'12px', padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f0f0f0'}}>
                  <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden', flexShrink:0}}>
                    {other.profilePic? <img src={other.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : (other.name?.[0]||'U')}
                  </div>
                  <div style={{flex:1, minWidth:0, borderBottom:'1px solid #f5f5f5'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <div style={{fontWeight:600, fontSize:'16px', color:'#111'}}>{other.name||'User'}</div>
                      <div style={{fontSize:'12px', color:'#666'}}>{chat.lastMessageAt?.seconds? new Date(chat.lastMessageAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):''}</div>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'2px'}}>
                      <div style={{fontSize:'14px', color:'#666', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'200px'}}>{chat.lastMessage||'...'}</div>
                      {unread>0 && <div style={{background:'#8d31ce', color:'#fff', borderRadius:'50%', minWidth:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', padding:'0 5px'}}>{unread}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STATUS TAB - Header bo lo, hemi chhungah vek a lang */}
        {activeTab==='status' && (
          <div style={{padding:'8px 0'}}>
            <div style={{padding:'12px 16px', display:'flex', gap:'12px', alignItems:'center'}} onClick={()=>router.push('/status/add')}>
              <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#e0e0e0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>+</div>
              <div><div style={{fontWeight:600}}>My Status</div><div style={{fontSize:'13px', color:'#666'}}>Tap to add status update</div></div>
            </div>
            <div style={{padding:'8px 16px', fontSize:'13px', color:'#666', background:'#f5f5f5', fontWeight:600}}>Recent updates</div>
            {statuses.map(st=>(
              <div key={st.id} style={{display:'flex', gap:'12px', padding:'12px 16px'}}>
                <div style={{width:'50px', height:'50px', borderRadius:'50%', border:'3px solid #8d31ce', padding:'2px'}}>
                  <div style={{width:'100%', height:'100%', borderRadius:'50%', background:'#ddd', overflow:'hidden'}}>{usersMap[st.userId]?.profilePic? <img src={usersMap[st.userId].profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : usersMap[st.userId]?.name?.[0]}</div>
                </div>
                <div><div style={{fontWeight:600}}>{usersMap[st.userId]?.name||'User'}</div><div style={{fontSize:'12px', color:'#666'}}>{st.createdAt?.seconds? new Date(st.createdAt.seconds*1000).toLocaleTimeString():''}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* ONLINE TAB - Header bo lo */}
        {activeTab==='online' && (
          <div>
            {onlineUsers.map(u=>(
              <div key={u.id} onClick={()=>router.push(`/chat/${u.id}`)} style={{display:'flex', gap:'12px', padding:'12px 16px', cursor:'pointer'}}>
                <div style={{position:'relative'}}>
                  <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden'}}>
                    {u.profilePic? <img src={u.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : u.name?.[0]}
                  </div>
                  <div style={{position:'absolute', bottom:0, right:0, width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>
                </div>
                <div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:'13px', color:'#22c55e'}}>online</div></div>
              </div>
            ))}
            {onlineUsers.length===0 && <div style={{textAlign:'center', padding:'40px', color:'#888'}}>No one online</div>}
          </div>
        )}
      </div>
    </div>
  );
}
