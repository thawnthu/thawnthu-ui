'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, writeBatch, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';

export default function ChatRoom() {
  const params = useParams();
  const otherUidRaw = params.id;
  const otherUid = Array.isArray(otherUidRaw)? otherUidRaw[0] : otherUidRaw as string;
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

  const getChatId = (uid1:string, uid2:string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(()=>{
    if(!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);

    const q = query(collection(db, "messages"), where("chatId", "==", chatId), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, async (snap)=>{
      const list = snap.docs.map(d=>({id:d.id,...d.data()} as any));
      setMessages(list);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 100);

      const batch = writeBatch(db);
      let needUpdate = false;
      list.forEach(m=>{
        if(m.receiverId===currentUid && m.status!=='seen'){
          batch.update(doc(db, "messages", m.id), { status:'seen', seenAt: serverTimestamp() });
          needUpdate = true;
        }
        if(m.receiverId===currentUid && m.status==='sent'){
          batch.update(doc(db, "messages", m.id), { status:'delivered', deliveredAt: serverTimestamp() });
          needUpdate = true;
        }
      });
      if(needUpdate){
        await batch.commit();
        try{
          await updateDoc(doc(db, "chats", chatId), {
            lastMessageStatus:'seen',
            [ `unreadCount.${currentUid}` ]: 0
          } as any);
        }catch{}
      }
    });
    return ()=>unsub();
  }, [currentUid, otherUid]);

  const sendMessage = async ()=>{
    if(!text.trim() ||!currentUid ||!otherUid) return;
    const chatId = getChatId(currentUid, otherUid);
    const msgText = text;
    setText('');

    const newMsg = {
      chatId,
      senderId: currentUid,
      receiverId: otherUid,
      text: msgText,
      status: 'sent',
      createdAt: serverTimestamp(),
      seen: false
    };
    const msgRef = await addDoc(collection(db, "messages"), newMsg);

    const chatDocRef = doc(db, "chats", chatId);
    try{
      await updateDoc(chatDocRef, {
        participants:[currentUid, otherUid],
        lastMessage: msgText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUid,
        lastMessageStatus: 'sent',
        updatedAt: serverTimestamp(),
        [ `unreadCount.${otherUid}` ]: 1
      } as any);
    }catch{
      await setDoc(chatDocRef, {
        participants:[currentUid, otherUid],
        lastMessage: msgText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUid,
        lastMessageStatus: 'sent',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [ `unreadCount.${otherUid}` ]: 1,
        [ `unreadCount.${currentUid}` ]: 0
      } as any, {merge:true});
    }

    setTimeout(async ()=>{
      try{
        await updateDoc(doc(db, "messages", msgRef.id), { status:'delivered', deliveredAt: serverTimestamp() });
        await updateDoc(chatDocRef, { lastMessageStatus:'delivered' } as any);
      }catch{}
    }, 1000);
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'calc(100vh - 52px)', background:'#e5ddd5'}}>
      <div style={{height:'60px', background:'#8d31ce', display:'flex', alignItems:'center', gap:'10px', padding:'0 10px', position:'fixed', top:'52px', left:0, right:0, zIndex:20}}>
        <button onClick={()=>router.back()} style={{background:'none', border:'none', cursor:'pointer'}}><ArrowLeft color="#fff"/></button>
        <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, overflow:'hidden'}}>
          {otherUser.profilePic? <img src={otherUser.profilePic} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : (otherUser.name||'U')[0]}
        </div>
        <div style={{flex:1}}>
          <div style={{color:'#fff', fontWeight:700}}>{otherUser.name||'User'}</div>
          <div style={{color:'#e0e0e0', fontSize:'12px'}}>{otherUser.online? 'online':'offline'}</div>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'70px 10px 80px', display:'flex', flexDirection:'column', gap:'6px'}}>
        {messages.map(m=>{
          const isMe = m.senderId===currentUid;
          return (
            <div key={m.id} style={{
              alignSelf: isMe? 'flex-end':'flex-start',
              background: isMe? '#dcf8c6':'#fff',
              borderRadius: isMe? '12px 0 12px 12px':'0 12px 12px 12px',
              padding:'8px 10px 4px',
              maxWidth:'75%',
              boxShadow:'0 1px 1px rgba(0,0,0,0.1)',
              display:'flex',
              flexDirection:'column'
            }}>
              <div style={{fontSize:'15px', color:'#111'}}>{m.text}</div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px', marginTop:'3px'}}>
                <span style={{fontSize:'10px', color:'#666'}}>
                  {m.createdAt?.seconds? new Date(m.createdAt.seconds*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):'...'}
                </span>
                {isMe && (
                  <>
                    {m.status==='sent' && <Check size={14} color="#999"/>}
                    {m.status==='delivered' && <CheckCheck size={14} color="#999"/>}
                    {m.status==='seen' && <CheckCheck size={14} color="#22c55e"/>}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#f0f0f0', padding:'8px 10px', display:'flex', gap:'8px', alignItems:'center'}}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Type a message" style={{flex:1, border:'none', borderRadius:'24px', padding:'12px 16px', outline:'none', fontSize:'15px'}}/>
        <button onClick={sendMessage} style={{background:'#8d31ce', border:'none', width:'44px', height:'44px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
          <Send size={20} color="#fff"/>
        </button>
      </div>
    </div>
  );
          }
