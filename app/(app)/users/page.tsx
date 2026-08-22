'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Search, UserPlus, Check, Clock, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [friendStatus, setFriendStatus] = useState<{[key:string]: string}>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (u) setCurrentUser(u); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((u:any) => u.id!== currentUser.uid);
      setUsers(list);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid || users.length === 0) return;
    users.forEach(async (u) => {
      const f = await getDoc(doc(db, 'users', currentUser.uid, 'friends', u.id));
      if (f.exists()) { setFriendStatus(prev => ({...prev, [u.id]: 'friends' })); return; }
      const out = await getDoc(doc(db, 'friendRequests', currentUser.uid + '_' + u.id));
      if (out.exists()) { setFriendStatus(prev => ({...prev, [u.id]: 'pending' })); return; }
      const inc = await getDoc(doc(db, 'friendRequests', u.id + '_' + currentUser.uid));
      if (inc.exists()) { setFriendStatus(prev => ({...prev, [u.id]: 'incoming' })); return; }
      setFriendStatus(prev => ({...prev, [u.id]: 'none' }));
    });
  }, [users, currentUser]);

  const sendRequest = async (u: any) => {
    if (!currentUser) return;
    const myData = await getDoc(doc(db, 'users', currentUser.uid));
    const my = myData.data();
    await setDoc(doc(db, 'friendRequests', currentUser.uid + '_' + u.id), {
      fromUid: currentUser.uid, toUid: u.id,
      fromName: my?.name || currentUser.email, fromPhoto: my?.photoURL || '',
      toName: u.name, createdAt: serverTimestamp()
    });
    setFriendStatus(prev => ({...prev, [u.id]: 'pending' }));
  };

  const isOnline = (u: any) => {
    if (u.isOnline) return true;
    if (!u.lastSeen) return false;
    const last = u.lastSeen?.toMillis? u.lastSeen.toMillis() : new Date(u.lastSeen).getTime();
    return Date.now() - last < 5 * 60 * 1000;
  };

  const filtered = users.filter((u: any) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ padding: 12 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Search size={20} color="#999" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15 }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {filtered.map((u: any, idx: number) => {
            const online = isOnline(u);
            const status = friendStatus[u.id] || 'none';
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderBottom: idx === filtered.length -1? 'none' : '1px solid #f3f4f6' }}>
                {/* 1. PIC BIAL AH PROFILE PIC UPLOAD MIL ZEL LANG */}
                <div onClick={() => router.push('/profile/' + u.id)} style={{ cursor: 'pointer' }}>
                  {u.photoURL? (
                    <img src={u.photoURL} alt={u.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: u.color || '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div onClick={() => router.push('/profile/' + u.id)} style={{ flex: 1, cursor: 'pointer' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{u.name || 'User'}</div>
                  {/* 2. EMAIL AIAH ONLINE/OFFLINE */}
                  <div style={{ fontSize: 13, color: online? '#22c55e' : '#999', fontWeight: 600, marginTop: 1 }}>
                    {online? 'Online' : 'Offline'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* 3. ADD FRIEND ICON - CHAT ICON TIAT CHIAH */}
                  {status === 'none' && (
                    <button onClick={() => sendRequest(u)} style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e5ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={18} color="#8d31ce" />
                    </button>
                  )}
                  {status === 'pending' && (
                    <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff7ed', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} color="#f97316" />
                    </button>
                  )}
                  {status === 'friends' && (
                    <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} color="#22c55e" />
                    </button>
                  )}
                  {status === 'incoming' && (
                    <button onClick={() => router.push('/profile/' + u.id)} style={{ width: 40, height: 40, borderRadius: '50%', background: '#e9e5ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={18} color="#8d31ce" />
                    </button>
                  )}

                  <button onClick={() => router.push('/chat/' + u.id)} style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f0ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={18} color="#8d31ce" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 14 }}>User hmuh tur an awm lo</div>}
        </div>
      </div>
    </div>
  );
}
