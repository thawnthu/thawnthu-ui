'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [tab, setTab] = useState('chat');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUid, setCurrentUid] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, u => { if(u) setCurrentUid(u.uid); });
    onSnapshot(collection(db, "users"), s => {
      setUsers(s.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
  }, []);

  const getPic = (u:any) => u?.profilePic || u?.photoURL || u?.image || u?.avatar || '';

  const otherUsers = users.filter(u => (u.uid||u.id)!== currentUid);
  const onlineUsers = otherUsers.filter(u => u.online === true);

  return (
    <div style={{background:'#f5f5f5', minHeight:'100vh'}}>
      {/* HEI HI TAB - HEADER HNUAIAH DING RENG TUR - A LANG LO CHUAN FILE I THLAK LO TINA */}
      <div style={{
        position:'fixed',
        top:'52px',
        left:0,
        right:0,
        zIndex:30,
        background:'#ffffff',
        display:'flex',
        height:'50px',
        borderBottom:'2px solid #e5e7eb',
        boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <button onClick={()=>setTab('chat')} style={{
          flex:1, border:'none', background: tab==='chat'?'#f3e8ff':'white',
          fontWeight:800, fontSize:'16px',
          color: tab==='chat'?'#8d31ce':'#666',
          borderBottom: tab==='chat'?'4px solid #8d31ce':'4px solid transparent',
          cursor:'pointer'
        }}>Chat ({otherUsers.length})</button>
        <button onClick={()=>setTab('status')} style={{
          flex:1, border:'none', background: tab==='status'?'#f3e8ff':'white',
          fontWeight:800, fontSize:'16px',
          color: tab==='status'?'#8d31ce':'#666',
          borderBottom: tab==='status'?'4px solid #8d31ce':'4px solid transparent',
          cursor:'pointer'
        }}>Status</button>
        <button onClick={()=>setTab('online')} style={{
          flex:1, border:'none', background: tab==='online'?'#f3e8ff':'white',
          fontWeight:800, fontSize:'16px',
          color: tab==='online'?'#8d31ce':'#666',
          borderBottom: tab==='online'?'4px solid #8d31ce':'4px solid transparent',
          cursor:'pointer'
        }}>Online ({onlineUsers.length})</button>
      </div>

      <div style={{paddingTop:'62px', padding:'62px 10px 10px'}}>
        {tab==='chat' && (
          <>
            <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#fff', borderRadius:'28px', padding:'14px 16px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'10px'}}>
              <Search size={20} color="#999"/><input placeholder="Search chat..." style={{flex:1, border:'none', outline:'none', fontSize:'15px', background:'none'}}/>
            </div>
            {otherUsers.map(u=>{
              const pic = getPic(u);
              return (
                <div key={u.id} onClick={()=>router.push(`/chat/${u.uid||u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 12px', background:'#fff', borderRadius:'14px', marginBottom:'6px', cursor:'pointer'}}>
                  <div style={{position:'relative'}}>
                    {pic? <img src={pic} alt="" style={{width:'52px', height:'52px', borderRadius:'50%', objectFit:'cover'}}/> : <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'20px'}}>{(u.name||'T')[0]}</div>}
                    {u.online && <div style={{position:'absolute', bottom:0, right:0, width:'12px', height:'12px', background:'#22c55e', borderRadius:'50%', border:'2px solid #fff'}}></div>}
                  </div>
                  <div style={{flex:1}}><div style={{fontWeight:700, fontSize:'16px'}}>{u.name||'Thangtea'}</div><div style={{fontSize:'13px', color:'#666'}}>Hiii</div></div>
                  <div style={{fontSize:'12px', color:'#888'}}>10:19 am</div>
                </div>
              );
            })}
          </>
        )}

        {tab==='status' && (
          <div style={{background:'#fff', borderRadius:'16px', padding:'14px'}}>
            <div style={{fontWeight:800, marginBottom:'12px'}}>Friends Status</div>
            {otherUsers.map(u=>{
              const pic = getPic(u);
              return (
                <div key={u.id} style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px'}}>
                  <div style={{width:'54px', height:'54px', borderRadius:'50%', padding:'3px', background:'linear-gradient(45deg,#f59e0b,#8d31ce)'}}>
                    <div style={{width:'100%', height:'100%', borderRadius:'50%', background:'#fff', padding:'2px'}}>
                      {pic? <img src={pic} alt="" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', borderRadius:'50%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>{u.name?.[0]}</div>}
                    </div>
                  </div>
                  <div><div style={{fontWeight:700}}>{u.name}</div><div style={{fontSize:'12px', color:'#888'}}>Today</div></div>
                </div>
              );
            })}
          </div>
        )}

        {tab==='online' && (
          <div style={{background:'#fff', borderRadius:'16px', padding:'14px'}}>
            <div style={{fontWeight:800, color:'#22c55e', marginBottom:'12px'}}>● Online Now ({onlineUsers.length})</div>
            {onlineUsers.map(u=>{
              const pic = getPic(u);
              return (
                <div key={u.id} onClick={()=>router.push(`/chat/${u.uid||u.id}`)} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px', background:'#f0fdf4', borderRadius:'12px', marginBottom:'6px'}}>
                  {pic? <img src={pic} alt="" style={{width:'48px', height:'48px', borderRadius:'50%'}}/> : <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{u.name?.[0]}</div>}
                  <div style={{flex:1, fontWeight:700}}>{u.name}</div><div style={{width:'10px', height:'10px', background:'#22c55e', borderRadius:'50%'}}></div>
                </div>
              );
            })}
            {onlineUsers.length===0 && <div style={{textAlign:'center', color:'#888', padding:'20px'}}>No friends online</div>}
          </div>
        )}
      </div>
    </div>
  );
                  }
