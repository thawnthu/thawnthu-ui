'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreVertical, Trash2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type ChatItem = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastSender: string;
  lastTimestamp: any;
  updatedAt?: any;
  unread?: any;
  seen?: any;
  otherUser?: any;
};

export default function ChatListPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState<string>('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setCurrentUid(u.uid); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUid) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUid), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const list: ChatItem[] = [];
      for (const d of snap.docs) {
        const data = d.data() as any;
        const otherId = data.participants.find((p: string) => p!== currentUid);
        let otherUser = null;
        if (otherId) {
          try {
            const uSnap = await getDoc(doc(db, "users", otherId));
            if (uSnap.exists()) otherUser = { id: uSnap.id,...uSnap.data() };
          } catch {}
        }
        list.push({ id: d.id, otherUser,...data } as ChatItem);
      }
      setChats(list);
    });
    return () => unsub();
  }, [currentUid]);

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';
  const getColor = (name: string) => ['#2563eb','#ef4444','#ff6b35','#f59e0b','#8d31ce'][(name?.length || 0) % 5];
  const formatTime = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate? ts.toDate() : new Date(ts);
      let h = date.getHours();
      const m = date.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12? 'pm' : 'am';
      h = h % 12; h = h? h : 12;
      return `${h}:${m} ${ampm}`;
    } catch { return ''; }
  };

  const getUnreadCount = (chat: ChatItem) => {
    if (!chat.lastSender || chat.lastSender === currentUid) return 0;
    // FIX: 0 anih chuan 0 return nghal - seen check luh loh tur
    if (chat.unread && typeof chat.unread[currentUid]!== 'undefined') {
      return chat.unread[currentUid] || 0;
    }
    if (!chat.seen ||!chat.seen[currentUid]) return 1;
    try {
      const lastT = chat.lastTimestamp?.toDate?.()?.getTime() || chat.updatedAt?.toDate?.()?.getTime() || 0;
      const seenT = chat.seen[currentUid]?.toDate?.()?.getTime() || 0;
      if (lastT > seenT + 1000) return 1;
    } catch {}
    return 0;
  };

  const handleOpenChat = async (chat: ChatItem) => {
    // FIX: Back arrow hmanga let leh a badge bo tur - local state update nghal
    setChats(prev => prev.map(c =>
      c.id === chat.id
       ? {...c, unread: {...(c.unread||{}), [currentUid]: 0 }, seen: {...(c.seen||{}), [currentUid]: new Date() } }
        : c
    ));

    try {
      await setDoc(doc(db, "chats", chat.id), { [`unread.${currentUid}`]: 0, [`seen.${currentUid}`]: serverTimestamp() }, { merge: true });
    } catch {}
    const otherId = chat.participants.find(p => p!== currentUid);
    router.push(`/chat/${otherId}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setChats(prev => prev.filter(c => c.id!== idToDelete));
    setDeleteId(null);
    setOpenMenuId(null);
    try { await deleteDoc(doc(db, "chats", idToDelete)); } catch (e: any) { console.log('Delete error:', e.message); }
  };

  const highlightText = (text: string, q: string) => {
    if (!q ||!text) return text;
    try {
      const regex = new RegExp(`(${q})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => regex.test(part)? <span key={i} style={{ background: '#ffeb3b', color: '#000', fontWeight: 700, borderRadius: '3px', padding: '0 2px' }}>{part}</span> : part);
    } catch { return text; }
  };

  const filtered = chats.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.otherUser?.name?.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 130px)' }}>
      <div style={{ position: 'sticky', top: '130px', zIndex: 15, padding: '10px 12px 12px 12px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px 16px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
          <Search size={20} color="#888" />
          <input type="text" placeholder="Search chat..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>
      <div style={{ padding: '0 12px 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {filtered.length===0? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>{search? `No chat for "${search}"` : 'Chat ala awm lo - Users atangin chat tan rawh'}</p>
          ) : filtered.map((chat) => {
            const unread = getUnreadCount(chat);
            const isUnread = unread > 0;
            return (
              <div key={chat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px', borderBottom: '1px solid #f0f0f0', background: isUnread? '#eef7ff' : '#fff', cursor: 'pointer', position: 'relative' }} onClick={() => handleOpenChat(chat)}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: getColor(chat.otherUser?.name || 'U'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>{getInitial(chat.otherUser?.name || '?')}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: isUnread? '800' : '600', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{highlightText(chat.otherUser?.name || 'Unknown', search)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: isUnread? '#2563eb' : '#888', fontWeight: isUnread? '700' : '400' }}>{formatTime(chat.lastTimestamp || chat.updatedAt)}</span>
                      {isUnread && (
                        <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: '700', minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                          {unread>9? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: isUnread? '#000' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', fontWeight: isUnread? '700' : '400' }}>
                      {isUnread? <b>Unread:</b> : 'Read:'} {highlightText(chat.lastMessage || '...', search)}
                    </p>
                  </div>
                </div>
                <div style={{ position: 'relative' }} onClick={(e)=>e.stopPropagation()}>
                  <button onClick={()=>setOpenMenuId(openMenuId===chat.id? null : chat.id)} style={{ border: 'none', background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MoreVertical size={18} color="#999" /></button>
                  {openMenuId===chat.id && (
                    <div style={{ position: 'absolute', right: 0, top: '32px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '120px', zIndex: 10, overflow: 'hidden' }}>
                      <button onClick={()=>{ setDeleteId(chat.id); setOpenMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}><Trash2 size={16}/> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={()=>setDeleteId(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '330px', background: '#fff', borderRadius: '20px', padding: '20px', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}><Trash2 size={22} color="#ef4444" /></div>
            <h3 style={{ margin: '0 0 6px 0', fontWeight: 800, fontSize: '1.1rem' }}>Delete chat?</h3>
            <p style={{ margin: '0 0 18px 0', color: '#666', fontSize: '0.9rem' }}>Are you sure you want to delete this chat?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={()=>setDeleteId(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: '#fff', color: '#000', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
