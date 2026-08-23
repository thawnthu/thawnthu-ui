'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Phone, Video, MoreVertical, Check, CheckCheck, Send } from 'lucide-react';

export default function ChatRoom() {
  const params = useParams();
  const otherUid = (Array.isArray(params.id)? params.id[0] : params.id) as string;
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>({});
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ onAuthStateChanged(auth, u=>{ if(u) setCurrentUid(u.uid); }); }, []);
  useEffect(()=>{
    if(!otherUid) return;
    const unsub = onSnapshot(doc(db, "users", otherUid), s=>{ if(s.exists()) setOtherUser(s.data()); });
    return ()=>unsub();
  }, [otherUid]);

  const getChatId = (a:string, b:string) => [a,b].sort().join('_');

  // MESSAGE LOAD - PIL CHHO DAih FIX
  useEffect(()=>{
    if(!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const unsub = onSnapshot(q, (snap)=>{
      let list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      list = list.sort((a,b)=>{
        const ta = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const tb = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return ta - tb;
      });
      setMessages(list);
      // Auto scroll bottom - pil chho tur venna
      setTimeout(()=>{
        if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 100);
    });
    return ()=>unsub();
  }, [currentUid, otherUid]);

  const sendMessage = async ()=>{
    if(!text.trim() ||!currentUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const msgText = text.trim();
    setText('');

    // Optimistic - hnuai lamah lang nghal
    const temp = { id: Date.now().toString(), chatId, senderId: currentUid, receiverId: otherUid, text: msgText, status:'sent', createdAt:{seconds: Date.now()/1000} };
    setMessages(p=>[...p, temp]);
    setTimeout(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);

    try{
      const ref = await addDoc(collection(db, "messages"), {
        chatId, senderId: currentUid, receiverId: otherUid,
        text: msgText, status:'sent', createdAt: serverTimestamp()
      });
      setTimeout(async()=>{ try{ await updateDoc(doc(db, "messages", ref.id), { status:'delivered' }); }catch{} }, 800);

      try{
        const chatRef = doc(db, "chats", chatId);
        const snap = await getDoc(chatRef);
        if(snap.exists()) await updateDoc(chatRef, { lastMessage: msgText, lastMessageAt: serverTimestamp(), lastMessageSenderId: currentUid } as any);
        else await setDoc(chatRef, { participants:[currentUid, otherUid], lastMessage: msgText, lastMessageAt: serverTimestamp(), lastMessageSenderId: currentUid } as any);
      }catch{}
    }catch(e){ console.log(e); }
  };

  return (
    <div style={{height:'100dvh', width:'100%', display:'flex', flexDirection:'column', background:'#efeae2', overflow:'hidden'}}>

      {/* HEADER - WhatsApp ang chiah */}
      <div style={{height:'60px', background:'#fff', display:'flex', alignItems:'center', gap:'8px', padding:'0 8px', borderBottom:'1px solid #e0e0e0', flexShrink:0}}>
        <button onClick={()=>router.back()} style={{background:'none', border:'none', padding:'8px', cursor:'pointer'}}><ArrowLeft size={22} color="#000"/></button>
        <div style={{width:'38px', height:'38px', borderRadius:'50%', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, overflow:'hidden', flexShrink:0}}>
          {otherUser.profilePic? <img src={otherUser.profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : (otherUser.name?.[0]||'T')}
        </div>
        <div style={{flex:1, minWidth:0, cursor:'pointer'}} onClick={()=>router.push(`/profile/${otherUid}`)}>
          <div style={{fontWeight:600, fontSize:'15px', color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{otherUser.name||'Thara'}</div>
          <div style={{fontSize:'12px', color:'#666'}}>{otherUser.online? 'online' : otherUser.lastSeen? `last seen today at ${new Date(otherUser.lastSeen.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 'offline'}</div>
        </div>
        <button style={{background:'none', border:'none', padding:'8px'}}><Video size={22} color="#000"/></button>
        <button style={{background:'none', border:'none', padding:'8px'}}><Phone size={20} color="#000"/></button>
        <button style={{background:'none', border:'none', padding:'8px'}}><MoreVertical size={20} color="#000"/></button>
      </div>

      {/* MESSAGE LIST - WhatsApp doodle background + pil chho fix */}
      <div ref={listRef} style={{
        flex:1, overflowY:'auto', overflowX:'hidden',
        padding:'12px 8px 12px',
        backgroundColor:'#efeae2',
        backgroundImage:`url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
        backgroundRepeat:'repeat',
        display:'flex', flexDirection:'column', gap:'4px'
      }}>
        {/* Date Separator */}
        <div style={{alignSelf:'center', background:'#fff', padding:'4px 12px', borderRadius:'12px', fontSize:'12px', color:'#555', margin:'8px 0', boxShadow:'0 1px 1px rgba(0,0,0,0.1)'}}>
          Today
        </div>

        {messages.map(m=>{
          const isMe = m.senderId===currentUid;
          const time = m.createdAt?.seconds? new Date(m.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'now';
          const isLink = m.text?.startsWith('http');
          return (
            <div key={m.id} style={{
              alignSelf: isMe? 'flex-end':'flex-start',
              background: isMe? '#dcf8c6':'#fff',
              borderRadius: isMe? '8px 0 8px 8px':'0 8px 8px 8px',
              padding:'6px 8px 4px 10px',
              maxWidth:'78%',
              boxShadow:'0 1px 0.5px rgba(0,0,0,0.13)',
              position:'relative'
            }}>
              {isLink? <a href={m.text} target="_blank" style={{color:'#0252b3', wordBreak:'break-all', fontSize:'15px'}}>{m.text}</a> : <div style={{fontSize:'15px', color:'#111', wordBreak:'break-word', lineHeight:'19px'}}>{m.text}</div>}
              <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'3px', marginTop:'2px', marginLeft:'10px', float:'right'}}>
                <span style={{fontSize:'11px', color:'#667781', marginTop:'4px'}}>{time}</span>
                {isMe && <span style={{marginLeft:'2px'}}>{m.status==='sent' && <Check size={14} color="#667781"/>}{m.status==='delivered' && <CheckCheck size={14} color="#667781"/>}{m.status==='seen' && <CheckCheck size={14} color="#53bdeb"/>}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT - WhatsApp ang */}
      <div style={{background:'#f0f0f0', padding:'5px 8px', display:'flex', gap:'6px', alignItems:'flex-end', flexShrink:0}}>
        <div style={{flex:1, background:'#fff', borderRadius:'24px', display:'flex', alignItems:'center', padding:'0 12px', minHeight:'44px'}}>
          <span style={{fontSize:'22px', marginRight:'6px'}}>☺</span>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') sendMessage();}} placeholder="Message" style={{flex:1, border:'none', outline:'none', fontSize:'16px', padding:'10px 0', background:'transparent'}}/>
          <span style={{display:'flex', gap:'12px', marginLeft:'8px', color:'#666'}}>
            <span style={{fontSize:'20px'}}>📎</span>
            <span style={{fontSize:'20px'}}>📷</span>
          </span>
        </div>
        <button onClick={sendMessage} style={{background:'#8d31ce', border:'none', width:'46px', height:'46px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
          {text.trim()? <Send size={20} color="#fff"/> : <span style={{fontSize:'22px'}}>🎤</span>}
        </button>
      </div>
    </div>
  );
                  }
