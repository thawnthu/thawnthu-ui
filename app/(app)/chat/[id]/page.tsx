'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';

export default function ChatRoom() {
  const params = useParams();
  const otherUid = (Array.isArray(params.id)? params.id[0] : params.id) as string;
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ onAuthStateChanged(auth, u=>{ if(u) setCurrentUid(u.uid); }); }, []);

  useEffect(()=>{
    if(!otherUid) return;
    const unsub = onSnapshot(doc(db, "users", otherUid), s=>{ if(s.exists()) setOtherUser(s.data()); });
    return ()=>unsub();
  }, [otherUid]);

  const getChatId = (a:string, b:string) => [a,b].sort().join('_');

  // MESSAGE LOAD - orderBy paih, client ah sort - index ngai lo
  useEffect(()=>{
    if(!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));

    const unsub = onSnapshot(q, async (snap)=>{
      let list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      // Client side sort - a thar ber hnuaiah
      list = list.sort((a,b)=>{
        const ta = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const tb = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        if(ta!==tb) return ta - tb;
        return (a.createdAt?.nanoseconds||0) - (b.createdAt?.nanoseconds||0);
      });
      setMessages(list);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 150);

      // SEEN logic
      const batch = writeBatch(db);
      let need=false;
      list.forEach(m=>{
        if(m.receiverId===currentUid && m.status!=='seen'){
          batch.update(doc(db, "messages", m.id), { status:'seen' });
          need=true;
        }
      });
      if(need) await batch.commit().catch(()=>{});
      if(need){
        try{ await updateDoc(doc(db, "chats", chatId), { lastMessageStatus:'seen', [`unreadCount.${currentUid}`]:0 } as any); }catch{}
      }
    }, (err)=>{ console.log("load error", err); });
    return ()=>unsub();
  }, [currentUid, otherUid]);

  const sendMessage = async ()=>{
    if(!text.trim()) return;
    if(!currentUid ||!otherUid){ alert("Login lo"); return; }
    const chatId = getChatId(currentUid, otherUid);
    const msgText = text.trim();
    setText('');

    // Optimistic UI - lang nghal
    const tempId = Date.now().toString();
    setMessages(prev=>[...prev, {id:tempId, chatId, senderId:currentUid, receiverId:otherUid, text:msgText, status:'sent', createdAt:{seconds:Date.now()/1000}, temp:true }]);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 50);

    try{
      const msgRef = await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUid,
        receiverId: otherUid,
        text: msgText,
        status:'sent',
        createdAt: serverTimestamp()
      });

      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);
      if(snap.exists()){
        await updateDoc(chatRef, {
          participants:[currentUid, otherUid],
          lastMessage: msgText,
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: currentUid,
          lastMessageStatus:'sent',
          [`unreadCount.${otherUid}`]: (snap.data().unreadCount?.[otherUid]||0)+1
        } as any);
      }else{
        await setDoc(chatRef, {
          participants:[currentUid, otherUid],
          lastMessage: msgText,
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: currentUid,
          lastMessageStatus:'sent',
          [`unreadCount.${otherUid}`]:1,
          [`unreadCount.${currentUid}`]:0,
          createdAt: serverTimestamp()
        } as any);
      }

      setTimeout(async()=>{
        try{
          await updateDoc(doc(db, "messages", msgRef.id), { status:'delivered' });
          await updateDoc(chatRef, { lastMessageStatus:'delivered' } as any);
        }catch{}
      }, 800);

    }catch(e:any){
      console.log("send error", e);
      alert("Message thawn failed: "+e.message);
    }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efeae2'}}>
      <div style={{height:'56px', background:'#8d31ce', display:'flex', alignItems:'center', gap:'10px', padding:'0 10px', position:'fixed', top:'0', left:0, right:0, zIndex:50}}>
        <button onClick={()=>router.back()} style={{background:'none', border:'none', cursor:'pointer'}}><ArrowLeft color="#fff" size={24}/></button>
        <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, overflow:'hidden', flexShrink:0}}>
          {otherUser.profilePic? <img src={otherUser.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <span style={{color:'#000'}}>{(otherUser.name||'N')[0]?.toUpperCase()}</span>}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{color:'#fff', fontWeight:700, fontSize:'16px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{otherUser.name||'Nghaktea'}</div>
          <div style={{color:'#e0d0ff', fontSize:'12px'}}>{otherUser.online? 'online':'offline'}</div>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'66px 10px 80px', display:'flex', flexDirection:'column', gap:'6px'}}>
        {messages.length===0 && <div style={{textAlign:'center', color:'#888', marginTop:'40px', fontSize:'14px'}}>No messages yet. Say hi!</div>}
        {messages.map(m=>{
          const isMe = m.senderId===currentUid;
          const time = m.createdAt?.seconds? new Date(m.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : m.createdAt?._seconds? new Date(m.createdAt._seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'now';
          return (
            <div key={m.id} style={{
              alignSelf: isMe? 'flex-end':'flex-start',
              background: isMe? '#dcf8c6':'#fff',
              borderRadius: isMe? '12px 0 12px 12px':'0 12px 12px 12px',
              padding:'8px 10px 4px',
              maxWidth:'78%',
              boxShadow:'0 1px 1px rgba(0,0,0,0.15)'
            }}>
              <div style={{fontSize:'15px', color:'#111', wordBreak:'break-word'}}>{m.text}</div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px', marginTop:'3px'}}>
                <span style={{fontSize:'10px', color:'#667781'}}>{time}</span>
                {isMe && (
                  <>
                    {m.status==='sent' && <Check size={14} color="#667781"/>}
                    {m.status==='delivered' && <CheckCheck size={14} color="#667781"/>}
                    {m.status==='seen' && <CheckCheck size={14} color="#53bdeb"/>}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#f0f0f0', padding:'8px 10px', display:'flex', gap:'8px', alignItems:'center', zIndex:50}}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') sendMessage();}} placeholder="Type a message" style={{flex:1, border:'none', borderRadius:'24px', padding:'12px 16px', outline:'none', fontSize:'15px', background:'#fff'}}/>
        <button onClick={sendMessage} style={{background:'#8d31ce', border:'none', width:'46px', height:'46px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
          <Send size={20} color="#fff"/>
        </button>
      </div>
    </div>
  );
}
