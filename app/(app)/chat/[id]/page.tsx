'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Search, User, Ban, Send, X } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, orderBy, query, addDoc, serverTimestamp, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const otherUid = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setCurrentUser(u); });
    return () => unsub();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current &&!menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!otherUid) return;
    const unsub = onSnapshot(doc(db, "users", otherUid), snap => {
      if (snap.exists()) setOtherUser({ id: snap.id,...snap.data() });
    });
    return () => unsub();
  }, [otherUid]);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    if (!currentUser?.uid ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id,...d.data() })));
    }, (err) => console.log("messages error", err));
    return () => unsub();
  }, [currentUser, otherUid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // FIX THAR - MESSAGE THAWN THEIH TAWH
  const handleSend = async () => {
    if (!newMsg.trim() ||!currentUser?.uid ||!otherUid) {
      console.log("no msg or user", newMsg, currentUser?.uid, otherUid);
      return;
    }
    const text = newMsg.trim();
    setNewMsg(''); // nghal a clear
    const chatId = getChatId(currentUser.uid, otherUid);
    try {
      // 1. chat doc update - unread chhiar belh
      await setDoc(doc(db, "chats", chatId), {
        participants: [currentUser.uid, otherUid],
        lastMessage: text,
        lastSender: currentUser.uid,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unread.${otherUid}`]: increment(1),
        [`unread.${currentUser.uid}`]: 0,
      }, { merge: true });

      // 2. message add
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text,
        senderId: currentUser.uid,
        receiverId: otherUid,
        timestamp: serverTimestamp(),
      });
      console.log("sent ok");
    } catch (e: any) {
      console.log("send error", e.message);
      alert("Send failed: " + e.message);
      setNewMsg(text); // fail chuan restore
    }
  };

  const handleBlock = async () => {
    if (!currentUser ||!otherUid) return;
    if (!confirm(`${otherUser?.name} block i duh tak tak em?`)) return;
    await setDoc(doc(db, "users", currentUser.uid, "blocked", otherUid), {
      uid: otherUid,
      name: otherUser?.name,
      blockedAt: serverTimestamp(),
    });
    alert(`${otherUser?.name} blocked`);
    setShowMenu(false);
    router.push('/users');
  };

  const isReallyOnline = (user: any) => {
    if (!user?.online ||!user?.lastSeen) return false;
    try {
      const last = user.lastSeen.toDate? user.lastSeen.toDate() : new Date(user.lastSeen);
      return Date.now() - last.getTime() < 2 * 60 * 1000;
    } catch { return false; }
  };

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || 'T';
  const filteredMessages = searchQ? messages.filter(m => m.text?.toLowerCase().includes(searchQ.toLowerCase())) : messages;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', background: '#e5ddd5', position: 'relative' }}>

      <div style={{
        position: 'sticky',
        top: '130px',
        zIndex: 18,
        background: '#8d31ce',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 8px 8px 4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ border: 'none', background: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={24} color="#fff" />
          </button>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', color: '#8d31ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', cursor: 'pointer' }}>
            {getInitial(otherUser?.name || 'D')}
          </div>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', lineHeight: '16px' }}>{otherUser?.name || 'Diktea'}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '2px' }}>{isReallyOnline(otherUser)? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }} ref={menuRef}>
          {showSearch? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', padding: '6px 10px' }}>
              <Search size={18} color="#888" />
              <input autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search messages" style={{ border: 'none', outline: 'none', marginLeft: '6px', width: '120px', fontSize: '14px' }} />
              <button onClick={() => { setShowSearch(false); setSearchQ(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} color="#888" /></button>
            </div>
          ) : null}

          <button onClick={() => setShowMenu(!showMenu)} style={{ border: 'none', background: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MoreVertical size={22} color="#fff" />
          </button>

          {showMenu && (
            <div style={{ position: 'absolute', right: '0', top: '44px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '170px', overflow: 'hidden', zIndex: 30 }}>
              <button onClick={() => { router.push(`/profile/${otherUid}`); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px 14px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#000' }}>
                <User size={18} /> Profile
              </button>
              <button onClick={handleBlock} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px 14px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#ef4444' }}>
                <Ban size={18} /> Block
              </button>
              <button onClick={() => { setShowSearch(true); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px 14px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#000' }}>
                <Search size={18} /> Search
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '80px', background: '#e5ddd5' }}>
        {filteredMessages.length===0 && <p style={{textAlign:'center', color:'#888', marginTop:'40px'}}>No messages yet - start chatting!</p>}
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
              <div style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: isMe? '14px 14px 0 14px' : '14px 14px 14px 0',
                background: isMe? '#8d31ce' : '#fff',
                color: isMe? '#fff' : '#000',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                fontSize: '15px',
                wordBreak: 'break-word'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 18,
        background: 'transparent',
        padding: '8px 10px 12px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '24px', padding: '8px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type a message..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', background: 'none', padding: '6px 0' }}
          />
        </div>
        <button onClick={handleSend} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#8d31ce', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
          <Send size={22} color="#fff" style={{ transform: 'rotate(0deg) translateX(1px)', marginLeft: '2px' }} />
        </button>
      </div>

    </div>
  );
          }
