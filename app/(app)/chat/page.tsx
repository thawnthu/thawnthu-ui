'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreVertical, Trash2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type ChatItem = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastSender: string;
  lastTimestamp: any;
  updatedAt?: any; // FIX: hemi ka add
  unread?: any;
  otherUser?: any;
};

export default function ChatListPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState<string>('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setCurrentUid(u.uid); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUid) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUid),
      orderBy("updatedAt", "desc")
    );
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
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000*60*60*24));
      if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch { return ''; }
  };

  const getUnreadCount = (chat: ChatItem) => {
    if (!chat.unread ||!currentUid) return 0;
    if (typeof chat.unread === 'object') {
      return chat.unread[currentUid] || 0;
    }
    return 0;
  };

  const handleOpenChat = async (chat: ChatItem) => {
    if (getUnreadCount(chat) > 0) {
      try {
        await updateDoc(doc(db, "chats", chat.id), {
          [`unread.${currentUid}`]: 0
        });
      } catch {}
    }
    const otherId = chat.participants.find(p => p!== currentUid);
    router.push(`/chat/${otherId}`);
  };

  const handleDelete = async (chatId: string) => {
    if (!confirm('He chat hi delete i duh em?')) return;
    try {
      await deleteDoc(doc(db, "chats", chatId));
    } catch (e) {
      alert('Delete failed');
    }
    setOpenMenuId(null);
  };

  const filtered = chats.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.otherUser?.name?.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 130px)' }}>
      <div style={{
        position: 'sticky',
        top: '130px',
        zIndex: 15,
        padding: '10px 12px 12px 12px',
        background: '#f5f5f5',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', padding: '14px 16px', borderRadius: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #eee'
        }}>
          <Search size={20} color="#888" />
          <input
            type="text"
            placeholder="Search chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
          />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {filtered.length===0? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>
              {search? `No chat for "${search}"` : 'Chat ala awm lo - Users atangin chat tan rawh'}
            </p>
          ) : filtered.map((chat) => {
            const unread = getUnreadCount(chat);
            return (
              <div key={chat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px', borderBottom: '1px solid #f0f0f0', background: unread>0? '#f9f5ff' : '#fff', cursor: 'pointer', position: 'relative' }}
                onClick={() => handleOpenChat(chat)}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: getColor(chat.otherUser?.name || 'U'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
                  {getInitial(chat.otherUser?.name || '?')}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: unread>0? '700' : '600', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {chat.otherUser?.name || 'Unknown'}
                    </p>
                    <span style={{ fontSize: '12px', color: unread>0? '#8d31ce' : '#888', fontWeight: unread>0? '700' : '400' }}>
                      {formatTime((chat as any).lastTimestamp || (chat as any).updatedAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: unread>0? '#000' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', fontWeight: unread>0? '600' : '400' }}>
                      {chat.lastSender===currentUid? 'You: ' : ''}{chat.lastMessage || '...'}
                    </p>
                    {unread>0 && (
                      <span style={{ background: '#8d31ce', color: '#fff', fontSize: '12px', fontWeight: '700', minWidth: '22px', height: '22px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                        {unread>9? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ position: 'relative' }} onClick={(e)=>e.stopPropagation()}>
                  <button onClick={()=>setOpenMenuId(openMenuId===chat.id? null : chat.id)} style={{ border: 'none', background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MoreVertical size={18} color="#999" />
                  </button>
                  {openMenuId===chat.id && (
                    <div style={{ position: 'absolute', right: 0, top: '32px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '120px', zIndex: 10, overflow: 'hidden' }}>
                      <button onClick={()=>handleDelete(chat.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                        <Trash2 size={16}/> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
                }
