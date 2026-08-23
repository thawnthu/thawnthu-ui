'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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

  useEffect(()=>{
    if(!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const unsub = onSnapshot(q, (snap)=>{
      let list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      list = list.sort((a,b)=>{
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return ta - tb;
      });
      setMessages(list);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 100);

      // seen update - fail pawh in ngaihsak lo
      list.forEach(async m=>{
        if(m.receiverId===currentUid && m.status!=='seen'){
          try{ await updateDoc(doc(db, "messages", m.id), { status:'seen' } as any); }catch{}
        }
      });
      if(list.some(m=>m.receiverId===currentUid && m.status!=='seen')){
        try{ updateDoc(doc(db, "chats", chatId), { lastMessageStatus:'seen', [`unreadCount.${currentUid}`]:0 } as any); }catch{}
      }
    });
    return ()=>unsub();
  }, [currentUid, otherUid]);

  const sendMessage = async ()=>{
    if(!text.trim() ||!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const msgText = text.trim();
    setText('');

    // lang nghal
    const tempId = Date.now().toString();
    setMessages(prev=>[...prev, {id:tempId, chatId, senderId:currentUid, receiverId:otherUid, text:msgText, status:'sent', createdAt:{seconds:Date.now()/1000}}]);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 50);

    try{
      const ref = await addDoc(collection(db, "messages"), {
        chatId, senderId: currentUid, receiverId: otherUid,
        text: msgText, status:'sent', createdAt: serverTimestamp()
      });
      // delivered ah thlak 800ms hnu ah
      setTimeout(async()=>{ try{ await updateDoc(doc(db, "messages", ref.id), { status:'delivered' }); }catch{} }, 800);

      // chat update - fail pawh in message chu a thleng tawh
      try{
        const chatRef = doc(db, "chats", chatId);
        const snap = await getDoc(chatRef);
        if(snap.exists()){
          await updateDoc(chatRef, { lastMessage: msgText, lastMessageAt: serverTimestamp(), lastMessageSenderId: currentUid, lastMessageStatus:'sent' } as any);
        }else{
          await setDoc(chatRef, { participants:[currentUid, otherUid], lastMessage: msgText, lastMessageAt: serverTimestamp(), lastMessageSenderId: currentUid, lastMessageStatus:'sent' } as any);
        }
      }catch{}
    }catch(e){ console.log(e); }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#efeae2'}}>
      <div style={{height:'56px', background:'#8d31ce', display:'flex', alignItems:'center', gap:'10px', padding:'0 10px', position:'fixed', top:0, left:0, right:0, zIndex:50}}>
        <button onClick={()=>router.back()} style={{background:'none', border:'none'}}><ArrowLeft color="#fff" size={24}/></button>
        <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, overflow:'hidden'}}>{otherUser.profilePic? <img src={otherUser.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <span style={{color:'#000'}}>{(otherUser.name||'N')[0]}</span>}</div>
        <div style={{flex:1}}><div style={{color:'#fff', fontWeight:700}}>{otherUser.name||'Thangtea'}</div><div style={{color:'#e0d0ff', fontSize:'12px'}}>{otherUser.online? 'online':'offline'}</div></div>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'66px 10px 80px', display:'flex', flexDirection:'column', gap:'6px'}}>
        {messages.map(m=>{
          const isMe = m.senderId===currentUid;
          const time = m.createdAt?.seconds? new Date(m.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'now';
          return (
            <div key={m.id} style={{alignSelf: isMe? 'flex-end':'flex-start', background: isMe? '#dcf8c6':'#fff', borderRadius: isMe? '12px 0 12px 12px':'0 12px 12px 12px', padding:'8px 10px 4px', maxWidth:'78%', boxShadow:'0 1px 1px rgba(0,0,0,0.15)'}}>
              <div style={{fontSize:'15px', color:'#111', wordBreak:'break-word'}}>{m.text}</div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px', marginTop:'3px'}}>
                <span style={{fontSize:'10px', color:'#667781'}}>{time}</span>
                {isMe && <>{m.status==='sent' && <Check size={14} color="#667781"/>}{m.status==='delivered' && <CheckCheck size={14} color="#667781"/>}{m.status==='seen' && <CheckCheck size={14} color="#53bdeb"/>}</>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>
      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#f0f0f0', padding:'8px 10px', display:'flex', gap:'8px', alignItems:'center', zIndex:50}}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') sendMessage();}} placeholder="Type a message" style={{flex:1, border:'none', borderRadius:'24px', padding:'12px 16px', outline:'none', fontSize:'15px', background:'#fff'}}/>
        <button onClick={sendMessage} style={{background:'#8d31ce', border:'none', width:'46px', height:'46px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Send size={20} color="#fff"/></button>
      </div>
    </div>
  );
}
