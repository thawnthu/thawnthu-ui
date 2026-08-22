'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Search, User, Ban, X, Check, CheckCheck } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, addDoc, serverTimestamp, setDoc, increment, updateDoc, writeBatch } from 'firebase/firestore';
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

  const getChatId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

  useEffect(() => {
    if (!currentUser?.uid ||!otherUid) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id,...d.data() })));
    });
    return () => unsub();
  }, [currentUser, otherUid]);

  // TICK LOGIC: Message deliver & read mark
  useEffect(() => {
    if (!currentUser?.uid ||!otherUid || messages.length === 0) return;
    const chatId = getChatId(currentUser.uid, otherUid);
    const batch = writeBatch(db);
    let hasUpdate = false;

    messages.forEach(m => {
      // Ka message a nih loh chuan - a rawn thleng tawh = delivered
      if (m.receiverId === currentUser.uid && m.status === 'sent') {
        batch.update(doc(db, "chats", chatId, "messages", m.id), { status: 'delivered' });
        hasUpdate = true;
      }
      // Ka en chuan read ah mark - chat ka hawng mek
      if (m.receiverId === currentUser.uid && (m.status === 'sent' || m.status === 'delivered')) {
        batch.update(doc(db, "chats", chatId, "messages", m.id), { status: 'read' });
        hasUpdate = true;
      }
    });

    if (hasUpdate) batch.commit().catch(()=>{});

    // Chat doc ah unread 0
    if (currentUser.uid) {
      setDoc(doc(db, "chats", chatId), { [`unread.${currentUser.uid}`]: 0 }, { merge: true }).catch(()=>{});
    }
  }, [messages, currentUser, otherUid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }, { merge: true });
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text,
        senderId: currentUser.uid,
        receiverId: otherUid,
        timestamp: serverTimestamp(),
        status: 'sent', // 1 tick
      });
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

  const isReallyOnline = (user: any) => {
    if (!user?.online ||!user?.lastSeen) return false;
    try {
      const last = user.lastSeen.toDate? user.lastSeen.toDate() : new Date(user.lastSeen);
      return Date.now() - last.getTime() < 2 * 60 * 1000;
    } catch { return false; }
  };

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || 'T';

  const formatMsgTime = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
    if (!prev) return true;
    try {
      const c = curr.timestamp?.toDate? curr.timestamp.toDate() : new Date(curr.timestamp);
      const p = prev.timestamp?.toDate? prev.timestamp.toDate() : new Date(prev.timestamp);
      return c.toDateString()!== p.toDateString();
    } catch { return false; }
  };

  const renderTick = (status: string, isMe: boolean) => {
    if (!isMe) return null;
    if (!status || status === 'sent') {
      return <Check size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: '4px' }} />;
    }
    if (status === 'delivered') {
      return <CheckCheck size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: '4px' }} />;
    }
    if (status === 'read') {
      return <CheckCheck size={14} color="#53bdeb" style={{ marginLeft: '4px' }} />;
    }
    return null;
  };

  const filteredMessages = searchQ? messages.filter(m => m.text?.toLowerCase().includes(searchQ.toLowerCase())) : messages;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100dvh - 120px)',
      background: '#e5ddd5',
      overflow: 'hidden',
      overscrollBehavior: 'contain',
    }}>

      {/* HEADER */}
      <div style={{
        background: '#8d31ce',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 8px 8px 4px',
        flexShrink: 0,
        height: '56px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ border: 'none', background: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={24} color="#fff" />
          </button>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', color: '#8d31ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>
            {getInitial(otherUser?.name || 'F')}
          </div>
          <div onClick={() => router.push(`/profile/${otherUid}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: '15px' }}>{otherUser?.name || 'Fela'}</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '2px' }}>{isReallyOnline(otherUser)? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={menuRef}>
          {showSearch? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', padding: '5px 10px' }}>
              <Search size={16} color="#888" />
              <input autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search" style={{ border: 'none', outline: 'none', marginLeft: '6px', width: '80px', fontSize: '13px' }} />
              <button onClick={() => { setShowSearch(false); setSearchQ(''); }} style={{ border: 'none', background: 'none' }}><X size={16} color="#888" /></button>
            </div>
          ) : null}
          <button onClick={() => setShowMenu(!showMenu)} style={{ border: 'none', background: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MoreVertical size={20} color="#fff" />
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: '0', top: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '160px', overflow: 'hidden', zIndex: 50 }}>
              <button onClick={() => { router.push(`/profile/${otherUid}`); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', fontSize: '14px', fontWeight: '700' }}><User size={16} /> Profile</button>
              <button onClick={handleBlock} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', borderBottom: '1px solid #f0f0f0', background: 'none', fontSize: '14px', fontWeight: '700', color: '#ef4444' }}><Ban size={16} /> Block</button>
              <button onClick={() => { setShowSearch(true); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', background: 'none', fontSize: '14px', fontWeight: '700' }}><Search size={16} /> Search</button>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES - 1. PIL BO FIX */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 8px 8px 8px',
          background: '#e5ddd5',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filteredMessages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser?.uid;
          const prev = idx > 0? filteredMessages[idx - 1] : null;
          const showDate = shouldShowDate(msg, prev);
          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                  <span style={{ background: '#fff', color: '#54656f', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontWeight: '500' }}>
                    {formatDateLabel(msg.timestamp)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe? 'flex-end' : 'flex-start', marginBottom: '3px' }}>
                <div style={{
                  maxWidth: '78%',
                  padding: '6px 7px 4px 9px',
                  borderRadius: isMe? '8px 8px 0 8px' : '8px 8px 8px 0',
                  background: isMe? '#8d31ce' : '#fff',
                  color: isMe? '#fff' : '#111b21',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                  position: 'relative',
                  minWidth: '90px'
                }}>
                  <span style={{ fontSize: '16.5px', lineHeight: '20px', fontWeight: '400', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </span>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '2px',
                    float: 'right',
                    marginLeft: '12px',
                    paddingTop: '4px'
                  }}>
                    <span style={{
                      fontSize: '10.5px',
                      color: isMe? 'rgba(255,255,255,0.85)' : '#667781',
                      fontWeight: '400',
                      lineHeight: '11px',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatMsgTime(msg.timestamp)}
                    </span>
                    {renderTick(msg.status, isMe)}
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} style={{ height: '2px' }} />
      </div>

      {/* INPUT - 4. BACKGROUND A NGAILO, 3. ENTER THEIH, 5. ARROW NGIL */}
      <div style={{
        background: 'transparent',
        padding: '6px 8px 10px 8px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', background: '#fff', borderRadius: '24px', padding: '6px 14px', boxShadow: '0 1px 1px rgba(0,0,0,0.08)', minHeight: '44px' }}>
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              background: 'none',
              padding: '8px 0',
              resize: 'none',
              maxHeight: '100px',
              lineHeight: '20px',
              fontFamily: 'inherit'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 100) + 'px';
            }}
          />
        </div>
        <button onClick={handleSend} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#8d31ce', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          {/* 5. ARROW NGIL - WHATSAPP ANG */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" style={{ transform: 'rotate(0deg)', marginLeft: '2px' }}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

    </div>
  );
                             }
