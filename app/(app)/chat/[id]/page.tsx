'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Search, User, Ban, X } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, onSnapshot, query, addDoc, serverTimestamp, setDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const otherUid = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatData, setChatData] = useState<any>(null);
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

  const getChatId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

  useEffect(() => {
    if (!currentUser?.uid ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const q = query(collection(db, "chats", chatId, "messages"));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id,...d.data() as any }));
      msgs.sort((a: any, b: any) => {
        const ta = a.timestamp?.toDate? a.timestamp.toDate().getTime() : (a.timestamp? new Date(a.timestamp).getTime() : 0);
        const tb = b.timestamp?.toDate? b.timestamp.toDate().getTime() : (b.timestamp? new Date(b.timestamp).getTime() : 0);
        return ta - tb;
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    });
    return () => unsub();
  }, [currentUser, otherUid]);

  useEffect(() => {
    if (!currentUser?.uid ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const unsub = onSnapshot(doc(db, "chats", chatId), snap => {
      if (snap.exists()) setChatData(snap.data());
    });
    return () => unsub();
  }, [currentUser, otherUid]);

  // FIX 1 & 2: Chat open rual a read nghal - Chat(3)->2 tur, typo siam that
  useEffect(() => {
    if (!currentUser?.uid ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    // Open rual a mark nghal - messages awm lo pawh nise
    setDoc(doc(db, "chats", chatId), {
      [`seen.${currentUser.uid}`]: serverTimestamp(),
      [`unread.${currentUser.uid}`]: 0
    }, { merge: true }).catch(()=>{});
  }, [currentUser, otherUid]);

  useEffect(() => {
    if (!currentUser?.uid ||!otherUid || messages.length === 0) return;
    // message thar lo thleng pawh read nghal zel
    const chatId = getChatId(currentUser.uid, otherUid);
    setDoc(doc(db, "chats", chatId), {
      [`seen.${currentUser.uid}`]: serverTimestamp(),
      [`unread.${currentUser.uid}`]: 0
    }, { merge: true }).catch(()=>{});
  }, [messages, currentUser, otherUid]);

  const isReallyOnline = (user: any) => {
    if (!user?.online ||!user?.lastSeen) return false;
    try {
      const last = user.lastSeen.toDate? user.lastSeen.toDate() : new Date(user.lastSeen);
      return Date.now() - last.getTime() < 180 * 1000;
    } catch { return false; }
  };

  const handleSend = async () => {
    if (!newMsg.trim() ||!currentUser?.uid ||!otherUid) return;
    const text = newMsg.trim();
    setNewMsg('');
    const chatId = getChatId(currentUser.uid, otherUid);
    try {
      await setDoc(doc(db, "chats", chatId), {
        participants: [currentUser.uid, otherUid],
        lastMessage: text,
        lastSender: currentUser.uid,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unread.${otherUid}`]: increment(1),
        [`unread.${currentUser.uid}`]: 0,
        [`seen.${currentUser.uid}`]: serverTimestamp(),
      }, { merge: true });
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text,
        senderId: currentUser.uid,
        receiverId: otherUid,
        timestamp: serverTimestamp(),
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) {
      setNewMsg(text);
    }
  };

  const handleBlock = async () => {
    if (!currentUser ||!otherUid) return;
    if (!confirm(`${otherUser?.name} block i duh tak tak em?`)) return;
    await setDoc(doc(db, "users", currentUser.uid, "blocked", otherUid), {
      uid: otherUid, name: otherUser?.name, blockedAt: serverTimestamp(),
    });
    setShowMenu(false);
    router.push('/users');
  };

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || 'T';
  const formatMsgTime = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate? ts.toDate() : new Date(ts);
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12? 'pm' : 'am';
      h = h % 12; h = h? h : 12;
      return `${h}:${m} ${ampm}`;
    } catch { return ''; }
  };
  const formatDateLabel = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate? ts.toDate() : new Date(ts);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
      const isToday = d.toDateString() === today.toDateString();
      const isYesterday = d.toDateString() === yesterday.toDateString();
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: d.getFullYear()!== today.getFullYear()? 'numeric' : undefined });
    } catch { return ''; }
  };
  const shouldShowDate = (curr: any, prev: any) => {
    if (!prev ||!curr.timestamp) return true;
    try {
      const c = curr.timestamp?.toDate? curr.timestamp.toDate() : new Date(curr.timestamp);
      const p = prev.timestamp?.toDate? prev.timestamp.toDate() : new Date(prev.timestamp);
      return c.toDateString()!== p.toDateString();
    } catch { return false; }
  };

  const filteredMessages = searchQ? messages.filter(m => m.text?.toLowerCase().includes(searchQ.toLowerCase())) : messages;

  return (
    <div style={{
      position: 'fixed',
      top: '135px',
      bottom: '0',
      left: '0',
      right: '0',
      display: 'flex',
      flexDirection: 'column',
      background: '#e5ddd5',
      overflow: 'hidden',
      zIndex: 5,
    }}>
      <div style={{
        background: '#8d31ce',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px 6px 4px',
        flexShrink: 0,
        height: '54px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ border: 'none', background: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="#fff" />
          </button>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', color: '#8d31ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
            {getInitial(otherUser?.name || 'T')}
          </div>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: '15px' }}>{otherUser?.name || 'User'}</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '2px' }}>{isReallyOnline(otherUser)? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={menuRef}>
          {showSearch? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', padding: '4px 10px' }}>
              <Search size={14} color="#888" />
              <input autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search" style={{ border: 'none', outline: 'none', marginLeft: '6px', width: '70px', fontSize: '12px' }} />
              <button onClick={() => { setShowSearch(false); setSearchQ(''); }} style={{ border: 'none', background: 'none' }}><X size={14} color="#888" /></button>
            </div>
          ) : null}
          <button onClick={() => setShowMenu(!showMenu)} style={{ border: 'none', background: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MoreVertical size={18} color="#fff" />
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: '0', top: '38px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '150px', overflow: 'hidden', zIndex: 50 }}>
              <button onClick={() => { router.push(`/profile/${otherUid}`); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', fontSize: '13px', fontWeight: '700' }}><User size={14} /> Profile</button>
              <button onClick={handleBlock} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', fontSize: '13px', fontWeight: '700', color: '#ef4444' }}><Ban size={14} /> Block</button>
              <button onClick={() => { setShowSearch(true); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', border: 'none', background: 'none', fontSize: '13px', fontWeight: '700' }}><Search size={14} /> Search</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#e5ddd5', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}></div>
        <div style={{ padding: '10px 18px 10px 18px' }}>
          {filteredMessages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser?.uid;
            const prev = idx > 0? filteredMessages[idx - 1] : null;
            const showDate = shouldShowDate(msg, prev);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <span style={{ background: '#fff', color: '#54656f', fontSize: '11px', padding: '3px 9px', borderRadius: '8px', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontWeight: '500' }}>
                      {formatDateLabel(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: isMe? 'flex-end' : 'flex-start', marginBottom: '4px', paddingLeft: isMe? '20px' : '0', paddingRight: isMe? '0' : '20px' }}>
                  <div style={{
                    maxWidth: '74%',
                    padding: '6px 8px 4px 10px',
                    borderRadius: isMe? '8px 8px 0 8px' : '8px 8px 8px 0',
                    background: isMe? '#8d31ce' : '#fff',
                    color: isMe? '#fff' : '#111b21',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    position: 'relative',
                    minWidth: '90px'
                  }}>
                    <span style={{ fontSize: '15px', lineHeight: '19px', fontWeight: '400', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2px', marginTop: '2px', float: 'right', marginLeft: '12px', paddingTop: '3px' }}>
                      <span style={{ fontSize: '10.5px', color: isMe? 'rgba(255,255,255,0.85)' : '#667781', fontWeight: '400', lineHeight: '10px', whiteSpace: 'nowrap' }}>
                        {formatMsgTime(msg.timestamp)}
                      </span>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} style={{ height: '2px' }} />
        </div>
      </div>

      <div style={{ background: '#e5ddd5', padding: '6px 14px 10px 14px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', padding: '2px 12px', boxShadow: '0 1px 1px rgba(0,0,0,0.08)', minHeight: '40px' }}>
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' &&!e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'none', padding: '6px 0', resize: 'none', maxHeight: '80px', lineHeight: '18px', fontFamily: 'inherit' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 80) + 'px';
            }}
          />
        </div>
        <button onClick={handleSend} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#8d31ce', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" style={{ marginLeft: '1px' }}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </div>
  );
      }
