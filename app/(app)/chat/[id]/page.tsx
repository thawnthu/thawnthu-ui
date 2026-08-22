'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const otherUid = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setCurrentUser(user);
      // other user info la
      const uDoc = await getDoc(doc(db, 'users', otherUid));
      if (uDoc.exists()) setOtherUser(uDoc.data());
      setLoading(false);
    });
    return () => unsub();
  }, [otherUid]);

  useEffect(() => {
    if (!currentUser ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('time', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id,...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [currentUser, otherUid]);

  const sendMessage = async () => {
    if (!text.trim() ||!currentUser) return;
    const chatId = getChatId(currentUser.uid, otherUid);

    // 1. Message dah
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: currentUser.uid,
      text: text.trim(),
      time: serverTimestamp(),
    });

    // 2. Chat list a lan nan lastMessage update
    await setDoc(doc(db, 'chats', chatId), {
      participants: [currentUser.uid, otherUid],
      lastMessage: text.trim(),
      lastTime: serverTimestamp(),
    }, { merge: true });

    setText('');
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>

      {/* HEADER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', background: '#8d31ce', color: '#fff',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft color="#fff" size={22} />
        </button>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: '#fff', color: '#8d31ce',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'
        }}>
          {otherUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{otherUser?.name}</p>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>{otherUser?.online? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((m) => {
          const isMe = m.senderId === currentUser.uid;
          return (
            <div key={m.id} style={{ alignSelf: isMe? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{
                background: isMe? '#8d31ce' : '#fff',
                color: isMe? '#fff' : '#000',
                padding: '10px 14px',
                borderRadius: isMe? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div style={{ padding: '10px', background: '#fff', display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #eee' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #e0e0e0', background: '#f5f5f5', outline: 'none', fontSize: '15px' }}
        />
        <button onClick={sendMessage} style={{ background: '#8d31ce', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}
