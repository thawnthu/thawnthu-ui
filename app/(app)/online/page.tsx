'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type UserItem = {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  online?: boolean;
  lastSeen?: any;
};

export default function OnlinePage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<UserItem[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setCurrentUid(u.uid); });
    return () => unsub();
  }, []);

  // 1. Ka friend list id te la
  useEffect(() => {
    if (!currentUid) return;

    // Option A: users/{uid}/friends subcollection
    const unsub1 = onSnapshot(collection(db, "users", currentUid, "friends"), snap => {
      const ids = snap.docs.map(d => d.id);
      if (ids.length > 0) setFriendIds(ids);
    });

    // Option B: users/{uid} doc ah friends array a awm chuan
    const unsub2 = onSnapshot(doc(db, "users", currentUid), snap => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.friends && Array.isArray(data.friends) && data.friends.length > 0) {
          setFriendIds(data.friends);
        }
        if (data.following && Array.isArray(data.following) && data.following.length > 0) {
          // following = friend list ang
          setFriendIds(prev => prev.length > 0? prev : data.following);
        }
      }
    });

    // Option C: friendships collection
    const q = query(collection(db, "friendships"), where("participants", "array-contains", currentUid));
    const unsub3 = onSnapshot(q, snap => {
      const ids: string[] = [];
      snap.docs.forEach(d => {
        const data = d.data() as any;
        if (data.status === 'accepted' ||!data.status) {
          const other = data.participants.find((p: string) => p!== currentUid);
          if (other) ids.push(other);
        }
      });
      if (ids.length > 0) setFriendIds(ids);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [currentUid]);

  // 2. Users zawng zawng cache
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      const map: any = {};
      snap.docs.forEach(d => { map[d.id] = { id: d.id,...d.data() }; });
      setUsersMap(map);
    });
    return () => unsub();
  }, []);

  // 3. Online friends chiah filter - 2 min chhung a active te
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      const now = Date.now();
      const list: UserItem[] = [];
      snap.docs.forEach(d => {
        const data = d.data() as any;
        const uid = d.id;
        if (uid === currentUid) return;

        // Friend list a awm chiah
        if (friendIds.length > 0 &&!friendIds.includes(uid)) return;

        // Online check - 2 min
        let isOnline = false;
        if (data.online && data.lastSeen) {
          try {
            const last = data.lastSeen.toDate? data.lastSeen.toDate() : new Date(data.lastSeen);
            isOnline = now - last.getTime() < 2 * 60 * 1000;
          } catch {}
        }
        if (isOnline) {
          list.push({ id: uid,...data });
        }
      });
      // Hming hmang in sort
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setOnlineFriends(list);
    });
    return () => unsub();
  }, [currentUid, friendIds, usersMap]);

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';
  const getColor = (name: string) => ['#2563eb','#ef4444','#ff6b35','#f59e0b','#8d31ce'][(name?.length || 0) % 5];

  const highlightText = (text: string, q: string) => {
    if (!q ||!text) return text;
    try {
      const regex = new RegExp(`(${q})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => regex.test(part)? <span key={i} style={{ background: '#ffeb3b', color: '#000', fontWeight: 700, borderRadius: '3px', padding: '0 2px' }}>{part}</span> : part);
    } catch { return text; }
  };

  const filtered = onlineFriends.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 130px)' }}>
      {/* Search - chungah ding reng - users page ang */}
      <div style={{ position: 'sticky', top: '55px', zIndex: 15, padding: '10px 12px 12px 12px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px 16px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
          <Search size={20} color="#888" />
          <input type="text" placeholder="Search online friends..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {filtered.length === 0? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#888', margin: '0 0 6px 0' }}>{friendIds.length === 0? 'Friend list ala awm lo' : search? `No online friend for "${search}"` : 'Online friend an awm lo'}</p>
              <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>{friendIds.length === 0? 'Users atangin friend add rawh' : 'I friend te an offline vek'}</p>
            </div>
          ) : filtered.map((user) => (
            <div key={user.id} onClick={() => router.push(`/chat/${user.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: '#fff' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: getColor(user.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700' }}>
                  {getInitial(user.name)}
                </div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }}></div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{highlightText(user.name || 'Unknown', search)}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#22c55e', fontWeight: '600' }}>Online</p>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                        }
