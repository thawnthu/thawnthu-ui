'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatMainPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [currentUser, setCurrentUser] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'chats'|'status'|'online'>('chats');
  const [chats, setChats] = useState<any[]>([]);
  const [myStatuses, setMyStatuses] = useState<any[]>([]);
  const [friendsStatus, setFriendsStatus] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});

  useEffect(()=>{
    onAuthStateChanged(auth, async u=>{
      if(u){
        setCurrentUid(u.uid);
        const s = await getDoc(doc(db, "users", u.uid));
        if(s.exists()) setCurrentUser(s.data());
      }
    });
  }, []);

  // All users
  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "users"), snap=>{
      const map:any={};
      const online:any[]=[];
      snap.docs.forEach(d=>{
        const data = d.data();
        map[d.id]=data;
        if(data.online && d.id!==currentUid) online.push({id:d.id,...data});
      });
      setUsersMap(map);
      setOnlineUsers(online);
    });
    return ()=>unsub();
  }, [currentUid]);

  // Chats
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

  // Statuses
  useEffect(()=>{
    if(!currentUid) return;
    const unsub = onSnapshot(collection(db, "statuses"), snap=>{
      const all = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      const mine = all.filter(s=>s.userId===currentUid);
      const friends = all.filter(s=>s.userId!==currentUid);
      setMyStatuses(mine);
      // group by user
      const grouped:any={};
      friends.forEach(s=>{
        if(!grouped[s.userId]) grouped[s.userId]=[];
        grouped[s.userId].push(s);
      });
      const friendList = Object.keys(grouped).map(uid=>({
        userId: uid,
        user: usersMap[uid] || {name:'User'},
        count: grouped[uid].length,
        latest: grouped[uid].sort((a:any,b:any)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))[0]
      }));
      setFriendsStatus(friendList);
    });
    return ()=>unsub();
  }, [currentUid, usersMap]);

  const getOtherUid = (chat:any) => chat.participants?.find((id:string)=>id!==currentUid);
  const getOtherUser = (chat:any) => usersMap[getOtherUid(chat)] || {};

  return (
    <div style={{minHeight:'100dvh', background:'#f5f3f7', display:'flex', flexDirection:'column'}}>
      {/* MzApp Header - BO LO, FIXED */}
      <div style={{background:'#8d31ce', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:30}}>
        <div style={{fontWeight:900, fontSize:'26px', color:'#fff', letterSpacing:'-0.5px'}}>Mz<span style={{color:'#ffe44d'}}>App</span></div>
        <div style={{display:'flex', gap:'14px', alignItems:'center'}}>
          <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}>🔍</div>
          <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>☰</div>
        </div>
      </div>

      {/* TAB - Chat Status Online - A BO DAWN LO */}
      <div style={{background:'#8d31ce', display:'flex', padding:'0 8px', gap:'8px', position:'sticky', top:'60px', zIndex:30}}>
        {[
          {id:'chats', label:'Chat'},
          {id:'status', label:'Status'},
          {id:'online', label:'Online'},
        ].map((tab:any)=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            flex:1, background: activeTab===tab.id? '#fff':'rgba(255,255,255,0.2)',
            color: activeTab===tab.id? '#8d31ce':'#fff',
            border:'none', borderRadius:'20px', padding:'8px 0', margin:'8px 0',
            fontWeight:700, fontSize:'14px', cursor:'pointer'
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{flex:1, padding:'12px'}}>

        {/* CHAT TAB */}
        {activeTab==='chats' && (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {chats.map(chat=>{
              const other = getOtherUser(chat);
              const otherUid = getOtherUid(chat);
              const unread = chat.unreadCount?.[currentUid]||0;
              return (
                <div key={chat.id} onClick={()=>router.push(`/chat/${otherUid}`)} style={{background:'#fff', borderRadius:'16px', padding:'12px', display:'flex', gap:'12px', alignItems:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden'}}>{other.profilePic? <img src={other.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : other.name?.[0]}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}><b>{other.name||'User'}</b><span style={{fontSize:'12px', color:'#888'}}>{chat.lastMessageAt?.seconds? new Date(chat.lastMessageAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):''}</span></div>
                    <div style={{fontSize:'13px', color:'#666', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{chat.lastMessage||'Start chatting'}</div>
                  </div>
                  {unread>0 && <div style={{background:'#8d31ce', color:'#fff', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>{unread}</div>}
                </div>
              );
            })}
            {chats.length===0 && <div style={{textAlign:'center', color:'#888', marginTop:'40px'}}>No chats yet - add friends to chat</div>}
          </div>
        )}

        {/* STATUS TAB - I SCREENSHOT ANG CHIAH */}
        {activeTab==='status' && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{background:'#fff', borderRadius:'24px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <span style={{color:'#888'}}>🔍</span><input placeholder="Search status..." style={{border:'none', outline:'none', flex:1, fontSize:'14px'}}/>
            </div>

            {/* My Status */}
            <div style={{background:'#fff', borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <div style={{position:'relative'}}>
                  <div style={{width:'56px', height:'56px', borderRadius:'50%', background: currentUser.profilePic? 'transparent':'#ff3b3b', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'22px', border:'3px solid #8d31ce', overflow:'hidden'}}>
                    {currentUser.profilePic? <img src={currentUser.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : currentUser.name?.[0]||'Y'}
                  </div>
                  <div style={{position:'absolute', bottom:'0', right:'0', width:'20px', height:'20px', background:'#8d31ce', borderRadius:'50%', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'12px'}}>+</div>
                </div>
                <div>
                  <div style={{fontWeight:700, fontSize:'15px'}}>My Status</div>
                  <div style={{fontSize:'12px', color:'#888'}}>{myStatuses.length>0? `${myStatuses.length} status • ${myStatuses[0]?.createdAt?.seconds? Math.floor((Date.now()/1000 - myStatuses[0].createdAt.seconds)/3600)+'h ago' : 'just now'}` : 'Tap to add'}</div>
                </div>
              </div>
              <button onClick={()=>router.push('/status/add')} style={{background:'#8d31ce', color:'#fff', border:'none', borderRadius:'20px', padding:'8px 18px', fontWeight:600, cursor:'pointer'}}>Add</button>
            </div>

            {/* Friends Status */}
            <div style={{background:'#fff', borderRadius:'16px', padding:'0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <div style={{padding:'12px 16px', fontWeight:600, fontSize:'14px', color:'#555', borderBottom:'1px solid #f0f0f0'}}>Friends Status ({friendsStatus.length})</div>
              {friendsStatus.map((f:any)=>(
                <div key={f.userId} onClick={()=>router.push(`/status/${f.userId}`)} style={{display:'flex', gap:'12px', padding:'12px 16px', alignItems:'center', cursor:'pointer', borderBottom:'1px solid #f9f9f9'}}>
                  <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#ff9f00', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, border:'3px solid #e0e0e0'}}>{f.user.profilePic? <img src={f.user.profilePic} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}}/> : f.user.name?.[0]||'N'}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontWeight:600}}>{f.user.name||'Nghaktea'}</div><div style={{fontSize:'11px', color:'#888'}}>{f.latest?.createdAt?.seconds? Math.floor((Date.now()/1000 - f.latest.createdAt.seconds)/3600)+'h ago':'9h ago'}</div></div>
                    <div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontSize:'13px', color:'#666'}}>{f.latest?.text||'Update chhin e'}</div><div style={{fontSize:'11px', color:'#888'}}>👁 {f.latest?.views||6}</div></div>
                  </div>
                </div>
              ))}
              {friendsStatus.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#888', fontSize:'13px'}}>No friends status</div>}
            </div>
          </div>
        )}

        {/* ONLINE TAB */}
        {activeTab==='online' && (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div style={{background:'#fff', borderRadius:'24px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px'}}><span>🔍</span><input placeholder="Search online..." style={{border:'none', outline:'none', flex:1}}/></div>
            {onlineUsers.map(u=>(
              <div key={u.id} onClick={()=>router.push(`/chat/${u.id}`)} style={{background:'#fff', borderRadius:'16px', padding:'12px', display:'flex', gap:'12px', alignItems:'center', cursor:'pointer'}}>
                <div style={{position:'relative'}}><div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden'}}>{u.profilePic? <img src={u.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : u.name?.[0]}</div><div style={{position:'absolute', bottom:0, right:0, width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div></div>
                <div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:'12px', color:'#22c55e'}}>online</div></div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
