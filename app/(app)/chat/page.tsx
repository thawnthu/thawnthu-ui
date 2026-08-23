'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatMainPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [activeTab, setActiveTab] = useState<'chats'|'status'|'online'>('chats');
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [myStatuses, setMyStatuses] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});

  useEffect(()=>{ onAuthStateChanged(auth, u=>{ if(u) setCurrentUid(u.uid); }); }, []);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "users"), snap=>{
      const map:any={}; const online:any[]=[];
      snap.docs.forEach(d=>{
        map[d.id]=d.data();
        if(d.data().online && d.id!==currentUid) online.push({id:d.id,...d.data()});
      });
      setUsersMap(map); setOnlineUsers(online);
    });
    return ()=>unsub();
  }, [currentUid]);

  useEffect(()=>{
    if(!currentUid) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUid));
    const unsub = onSnapshot(q, snap=>{
      let list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      list = list.sort((a,b)=>(b.lastMessageAt?.seconds||0)-(a.lastMessageAt?.seconds||0));
      setChats(list);
    });
    return ()=>unsub();
  }, [currentUid]);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "statuses"), snap=>{
      const all = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      setStatusList(all);
      setMyStatuses(all.filter(s=>s.userId===currentUid));
    });
    return ()=>unsub();
  }, [currentUid]);

  const getOtherUid = (chat:any) => chat.participants?.find((id:string)=>id!==currentUid);
  const getOtherUser = (chat:any) => usersMap[getOtherUid(chat)] || {};

  // SEARCH FILTER
  const filteredChats = chats.filter(c=>{
    const other = getOtherUser(c);
    return (other.name||'').toLowerCase().includes(search.toLowerCase()) || (c.lastMessage||'').toLowerCase().includes(search.toLowerCase());
  });
  const filteredStatus = statusList.filter(s=> s.userId!==currentUid).filter(s=>{
    const u = usersMap[s.userId];
    return (u?.name||'').toLowerCase().includes(search.toLowerCase());
  });
  const filteredOnline = onlineUsers.filter(u=> u.name.toLowerCase().includes(search.toLowerCase()));

  const myStatusCount = myStatuses.length;
  const friendsStatusGrouped:any={};
  filteredStatus.forEach(s=>{
    if(!friendsStatusGrouped[s.userId]) friendsStatusGrouped[s.userId]=[];
    friendsStatusGrouped[s.userId].push(s);
  });

  return (
    <div style={{background:'#f2f0f5', minHeight:'calc(100vh - 56px)', paddingBottom:'20px'}}>

      {/* TABS ONLY - Header double tawh lo, MzApp tih bo */}
      <div style={{background:'#8d31ce', padding:'8px 12px', display:'flex', gap:'8px', position:'sticky', top:0, zIndex:10}}>
        {[
          {id:'chats', label:'Chat'},
          {id:'status', label:'Status'},
          {id:'online', label:'Online'},
        ].map((tab:any)=>(
          <button key={tab.id} onClick={()=>{setActiveTab(tab.id); setSearch('');}} style={{
            flex:1, background: activeTab===tab.id? '#fff':'rgba(255,255,255,0.25)',
            color: activeTab===tab.id? '#8d31ce':'#fff',
            border:'none', borderRadius:'20px', padding:'10px 0',
            fontWeight:700, fontSize:'14px', cursor:'pointer'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* SEARCH */}
      <div style={{padding:'10px 12px'}}>
        <div style={{background:'#fff', borderRadius:'24px', padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={activeTab==='chats'? 'Search chat...': activeTab==='status'? 'Search status...':'Search online...'} style={{border:'none', outline:'none', flex:1, fontSize:'14px'}}/>
        </div>
      </div>

      <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:'10px'}}>

        {activeTab==='chats' && filteredChats.map(chat=>{
          const other = getOtherUser(chat);
          const otherUid = getOtherUid(chat);
          const unread = chat.unreadCount?.[currentUid]||0;
          return (
            <div key={chat.id} onClick={()=>router.push(`/chat/${otherUid}`)} style={{background:'#fff', borderRadius:'16px', padding:'14px', display:'flex', gap:'12px', alignItems:'center', cursor:'pointer'}}>
              <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden', flexShrink:0}}>{other.profilePic? <img src={other.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : (other.name?.[0]||'U')}</div>
              <div style={{flex:1, minWidth:0}}><div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontWeight:700, fontSize:'15px'}}>{other.name||'User'}</div><div style={{fontSize:'12px', color:'#888'}}>{chat.lastMessageAt?.seconds? new Date(chat.lastMessageAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):''}</div></div><div style={{fontSize:'13px', color:'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{chat.lastMessage||'Tap to chat'}</div></div>
              {unread>0 && <div style={{background:'#8d31ce', color:'#fff', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px'}}>{unread}</div>}
            </div>
          );
        })}

        {activeTab==='status' && (
          <>
            {/* My Status - CLICK THEIH */}
            <div style={{background:'#fff', borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <div style={{position:'relative', cursor:'pointer'}} onClick={()=>router.push('/status/add')}>
                  <div style={{width:'52px', height:'52px', borderRadius:'50%', border:'3px solid #8d31ce', display:'flex', alignItems:'center', justifyContent:'center', background:'#ff3b3b', color:'#fff', fontWeight:800, overflow:'hidden'}}>{usersMap[currentUid]?.profilePic? <img src={usersMap[currentUid]?.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : usersMap[currentUid]?.name?.[0]||'Y'}</div>
                  <div style={{position:'absolute', bottom:0, right:0, width:'18px', height:'18px', background:'#8d31ce', borderRadius:'50%', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'10px'}}>+</div>
                </div>
                <div style={{cursor:'pointer'}} onClick={()=> myStatusCount>0 && router.push(`/status/${currentUid}`)}>
                  <div style={{fontWeight:700}}>My Status</div>
                  <div style={{fontSize:'12px', color:'#888'}}>{myStatusCount>0? `${myStatusCount} status • 2h ago` : 'Tap to add status'}</div>
                </div>
              </div>
              <button onClick={()=>router.push('/status/add')} style={{background:'#8d31ce', color:'#fff', border:'none', borderRadius:'20px', padding:'8px 18px', fontWeight:600, cursor:'pointer'}}>Add</button>
            </div>

            {/* Friends Status - CLICK THEIH */}
            <div style={{background:'#fff', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{padding:'12px 16px', fontWeight:600, color:'#555', borderBottom:'1px solid #f0f0f0', fontSize:'14px'}}>Friends Status ({Object.keys(friendsStatusGrouped).length})</div>
              {Object.keys(friendsStatusGrouped).map(uid=>{
                const list = friendsStatusGrouped[uid];
                const user = usersMap[uid]||{name:'Nghaktea'};
                const latest = list[0];
                return (
                  <div key={uid} onClick={()=>router.push(`/status/${uid}`)} style={{display:'flex', gap:'12px', padding:'12px 16px', alignItems:'center', cursor:'pointer', borderBottom:'1px solid #f8f8f8'}}>
                    <div style={{width:'48px', height:'48px', borderRadius:'50%', border:'3px solid #ff9f00', display:'flex', alignItems:'center', justifyContent:'center', background:'#ffb22c', color:'#fff', fontWeight:700, overflow:'hidden'}}>{user.profilePic? <img src={user.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : user.name?.[0]||'N'}</div>
                    <div style={{flex:1}}><div style={{display:'flex', justifyContent:'space-between'}}><b>{user.name||'Nghaktea'}</b><span style={{fontSize:'11px', color:'#888'}}>9h ago</span></div><div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontSize:'13px', color:'#666'}}>{latest?.text||'Update chhin e'}</span><span style={{fontSize:'11px', color:'#888'}}>👁 {latest?.views||6}</span></div></div>
                  </div>
                );
              })}
              {Object.keys(friendsStatusGrouped).length===0 && <div style={{padding:'20px', textAlign:'center', color:'#888'}}>No status found</div>}
            </div>
          </>
        )}

        {activeTab==='online' && filteredOnline.map(u=>(
          <div key={u.id} onClick={()=>router.push(`/chat/${u.id}`)} style={{background:'#fff', borderRadius:'16px', padding:'12px', display:'flex', gap:'12px', alignItems:'center', cursor:'pointer'}}>
            <div style={{position:'relative'}}><div style={{width:'48px', height:'48px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden'}}>{u.profilePic? <img src={u.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : u.name?.[0]}</div><div style={{position:'absolute', bottom:0, right:0, width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div></div>
            <div><div style={{fontWeight:700}}>{u.name}</div><div style={{fontSize:'12px', color:'#22c55e'}}>online</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
