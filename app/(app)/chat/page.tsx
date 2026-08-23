'use client';
import { useState, useEffect } from 'react';
import { Search, Check, CheckCheck } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUid, setCurrentUid] = useState('');
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    onAuthStateChanged(auth, u => { if(u) setCurrentUid(u.uid); });
    onSnapshot(collection(db, "users"), s => {
      const list = s.docs.map(d=>({id:d.id,...d.data()} as any));
      setUsers(list);
      const map: Record<string, any> = {};
      list.forEach(u=>{ map[u.id]=u; if(u.uid) map[u.uid]=u; });
      setUsersMap(map);
    });
    onSnapshot(query(collection(db, "chats"), orderBy("lastMessageAt", "desc")), s => {
      setChats(s.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
    onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), s => {
      setMessages(s.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
  }, []);

  const getPic = (u:any) => u?.profilePic || u?.photoURL || u?.image || u?.avatar || '';

  // Chat list - a thar apiang chung ber ah
  const myChats = chats
   .filter(c => c.participants?.includes(currentUid))
   .sort((a,b)=> (b.lastMessageAt?.seconds||b.updatedAt?.seconds||0) - (a.lastMessageAt?.seconds||a.updatedAt?.seconds||0));

  const otherUsers = users.filter(u => (u.uid||u.id)!== currentUid);

  // Search filter
  const filteredChats = myChats.filter(c=>{
    const otherId = c.participants?.find((id:string)=>id!==currentUid);
    const user = usersMap[otherId] || {};
    const name = (user.name||'').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // A la chat lo te pawh - a chung ber ah latest message awm ang
  const displayList = filteredChats.length>0 || search? filteredChats : myChats.length>0? myChats : otherUsers.slice(0,20).map(u=>({id:u.id, participants:[currentUid, u.uid||u.id], isFake:true, fakeUser:u}));

  return (
    <div style={{background:'#f5f5f5', minHeight:'100vh'}}>
      {/* TAB - Chat tih tawp, count awm lo */}
      <div style={{
        position:'fixed',
        top:'52px',
        left:0,
        right:0,
        zIndex:30,
        background:'#fff',
        display:'flex',
        height:'48px',
        borderBottom:'1px solid #e5e7eb'
      }}>
        <button style={{flex:1, border:'none', background:'#f3e8ff', fontWeight:800, fontSize:'16px', color:'#8d31ce', borderBottom:'3px solid #8d31ce'}}>Chat</button>
        <button onClick={()=>router.push('/status')} style={{flex:1, border:'none', background:'#fff', fontWeight:600, fontSize:'15px', color:'#666', cursor:'pointer'}}>Status</button>
        <button onClick={()=>router.push('/online')} style={{flex:1, border:'none', background:'#fff', fontWeight:600, fontSize:'15px', color:'#666', cursor:'pointer'}}>Online</button>
      </div>

      {/* SEARCH - TAWLH VE SUH SE, DING RENG TUR - FIXED */}
      <div style={{
        position:'fixed',
        top:'100px',
        left:0,
        right:0,
        zIndex:29,
        background:'#f5f5f5',
        padding:'10px 10px',
      }}>
        <div style={{
          display:'flex',
          alignItems:'center',
          gap:'10px',
          background:'#fff',
          borderRadius:'28px',
          padding:'13px 16px',
          boxShadow:'0 2px 12px rgba(0,0,0,0.10)'
        }}>
          <Search size={20} color="#999" strokeWidth={2.5}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chat..." style={{flex:1, border:'none', outline:'none', fontSize:'15px', background:'none'}}/>
        </div>
      </div>

      {/* LIST - message thar apiang chung ber ah */}
      <div style={{paddingTop:'162px', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'10px'}}>
        {displayList.map((c:any)=>{
          const isFake = c.isFake;
          const otherId = isFake? (c.fakeUser.uid||c.fakeUser.id) : c.participants?.find((id:string)=>id!==currentUid);
          const user = isFake? c.fakeUser : (usersMap[otherId] || {});
          const pic = getPic(user);
          const name = user.name || user.displayName || 'User';

          // last message & status
          const lastMsg = c.lastMessage || c.lastMessageText || (isFake? 'Tap to chat':'Hiii');
          const lastSender = c.lastMessageSenderId || c.senderId;
          const isMe = lastSender===currentUid;
          const status = c.lastMessageStatus || c.status || 'seen'; // sent, delivered, seen
          const unread = c.unreadCount?.[currentUid] || c.unread || (!isMe && c.lastMessage && status!=='seen'? 1:0);
          // time
          const ts = c.lastMessageAt?.seconds? new Date(c.lastMessageAt.seconds*1000) : new Date();
          const timeStr = ts.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});

          return (
            <div key={c.id} onClick={()=>router.push(`/chat/${otherId}`)} style={{
              display:'flex',
              alignItems:'center',
              gap:'12px',
              padding:'12px 12px',
              background:'#fff',
              borderRadius:'14px',
              marginBottom:'6px',
              cursor:'pointer',
              boxShadow:'0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{position:'relative', flexShrink:0}}>
                {pic? <img src={pic} alt="" style={{width:'52px', height:'52px', borderRadius:'50%', objectFit:'cover', border:'2px solid #f0f0f0'}}/> : <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'20px'}}>{name[0]?.toUpperCase()}</div>}
                {user.online && <div style={{position:'absolute', bottom:'1px', right:'1px', width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>}
              </div>

              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:700, fontSize:'16px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{name}</div>
                  <div style={{display:'flex', alignItems:'center', gap:'6px', flexShrink:0, marginLeft:'8px'}}>
                    <span style={{fontSize:'11px', color:'#888'}}>{isFake? '': timeStr}</span>
                    {unread>0 && (
                      <span style={{
                        background:'#8d31ce',
                        color:'#fff',
                        borderRadius:'50%',
                        minWidth:'20px',
                        height:'20px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        fontSize:'11px',
                        fontWeight:800,
                        padding:'0 5px'
                      }}>{unread>9? '9+': unread}</span>
                    )}
                  </div>
                </div>

                <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                  {isMe &&!isFake && (
                    <span style={{display:'flex', alignItems:'center'}}>
                      {status==='sent' && <Check size={16} color="#999"/>}
                      {status==='delivered' && <CheckCheck size={16} color="#999"/>}
                      {status==='seen' && <CheckCheck size={16} color="#22c55e"/>}
                    </span>
                  )}
                  <div style={{fontSize:'14px', color: unread>0? '#111':'#666', fontWeight: unread>0? '600':'400', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{lastMsg}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
