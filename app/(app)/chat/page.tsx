'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type ChatItem = {
  id: string;
  participants: string[];
  otherUser: any;
  lastMessage: string;
  lastTime: any;
};

export default function ChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUid(user.uid);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUid),
      orderBy("lastTime", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const chatList: ChatItem[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        const otherUid = data.participants.find((p: string) => p!== currentUid);
        if (!otherUid) continue;

        // other user info la
        try {
          const userDoc = await getDoc(doc(db, "users", otherUid));
          if (userDoc.exists()) {
            chatList.push({
              id: d.id,
              participants: data.participants,
              otherUser: { uid: otherUid,...userDoc.data() },
              lastMessage: data.lastMessage || '',
              lastTime: data.lastTime,
            });
          }
        } catch {}
      }
      setChats(chatList);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUid]);

  const filtered = chats.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';
  const getColor = (name: string) => {
    const colors = ['#2563eb', '#ef4444', '#ff6b35', '#f59e0b', '#8d31ce'];
    return colors[(name?.length || 0) % colors.length];
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* SEARCH - Users ang chiah */}
      <div style={{ padding: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fff',
          padding: '16px 16px',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Search size={20} color="#888" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
          />
        </div>
      </div>

      {/* CHAT LIST - Users ang chiah a kual */}
      <div style={{
        margin: '0 12px',
        background: '#fff',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {loading? (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>Loading chats...</p>
        ) : filtered.length === 0? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#666', fontSize: '15px' }}>Chat i la nei lo</p>
            <button onClick={() => router.push('/users')} style={{ marginTop: '12px', background: '#8d31ce', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
              Users en rawh
            </button>
          </div>
        ) : (
          filtered.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.otherUser.uid}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                padding: '14px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: getColor(chat.otherUser.name), color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: '700',
                  }}>
                  {getInitial(chat.otherUser.name)}
                </div>
                {chat.otherUser.online && (
                  <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
                )}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000' }}>{chat.otherUser.name}</p>
                  <span style={{ fontSize: '11px', color: '#888' }}>{formatTime(chat.lastTime)}</span>
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.lastMessage || `${chat.otherUser.email}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
                                                                  }
