'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageCircle, UserPlus, Check, Clock } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

type User = { id: string; uid: string; name: string; email: string; online?: boolean; lastSeen?: any; photoURL?: string; };

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id,...d.data() } as User));
      setUsers(list.filter(u => (u.uid || u.id) !== auth.currentUser?.uid));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // FIX: friends subcollection chiah en - array field a ngai lo
    const unsubFriendsCol = onSnapshot(collection(db, "users", uid, "friends"), (snap) => {
      const ids = snap.docs.map(d => d.id);
      setFriends(new Set(ids));
    });

    // FIX: field hming dik - profile page nen in mil: fromUid / toUid
    const q = query(collection(db, "friendRequests"), where("fromUid", "==", uid));
    const unsubReq = onSnapshot(q, (snap) => {
      const ids = snap.docs.map(d => d.data().toUid);
      setSentRequests(new Set(ids));
    });

    return () => { unsubFriendsCol(); unsubReq(); };
  }, []);

  const handleAddFriend = async (targetUser: User) => {
    const uid = auth.currentUser?.uid;
    if (!uid || sending) return;
    const targetUid = targetUser.uid || targetUser.id;
    if (friends.has(targetUid) || sentRequests.has(targetUid)) return;

    setSending(targetUid);
    try {
      // FIX: current user data dik tak la - displayName mai ni lo
      const mySnap = await getDoc(doc(db, "users", uid));
      const myData = mySnap.exists() ? mySnap.data() as any : {};
      const fromName = myData.name || auth.currentUser?.displayName || "User";
      const fromPhoto = myData.photoURL || auth.currentUser?.photoURL || "";

      const reqId = `${uid}_${targetUid}`;
      // FIX: field hming profile page nen in mil vek
      await setDoc(doc(db, "friendRequests", reqId), {
        fromUid: uid,
        toUid: targetUid,
        fromName: fromName,
        fromPhoto: fromPhoto,
        toName: targetUser.name,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // FIX: notification - target user hnen ah dah dik
      await setDoc(doc(db, "users", targetUid, "notifications", uid + '_' + Date.now()), {
        type: "friendRequest",
        fromUid: uid,
        fromName: fromName,
        fromPhoto: fromPhoto,
        message: `${fromName} sent you a friend request`,
        read: false,
        createdAt: serverTimestamp()
      });

      setSentRequests(prev => {
        const next = new Set(prev);
        next.add(targetUid);
        return next;
      });
    } catch (e) {
      console.log("Friend request error", e);
    }
    setSending(null);
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';
  const getColor = (name: string) => ['#2563eb','#ef4444','#ff6b35','#f59e0b','#8d31ce'][(name?.length || 0) % 5];
  const isReallyOnline = (user: User) => {
    if (!user.online ||!user.lastSeen) return false;
    try { const last = user.lastSeen.toDate? user.lastSeen.toDate() : new Date(user.lastSeen); return Date.now() - last.getTime() < 2*60*1000; } catch { return false; }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: '40px', zIndex: 15, padding: '10px 12px 12px 12px', background: '#f5f5f5', borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px 16px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
          <Search size={20} color="#888" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {loading? <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>Loading users...</p>
          : filtered.length===0? <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>No users found</p>
          : filtered.map((user) => {
            const uid = user.uid || user.id;
            const isFriend = friends.has(uid);
            const isSent = sentRequests.has(uid);
            return (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '14px 14px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/profile/${user.uid || user.id}`)}>
                {user.photoURL? (
                  <img src={user.photoURL} alt={user.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getColor(user.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700' }}>{getInitial(user.name)}</div>
                )}
                {isReallyOnline(user) && <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>}
              </div>
              <div style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => router.push(`/profile/${user.uid || user.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000' }}>{user.name}</p>
                  {isReallyOnline(user) && <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>}
                </div>
                <p style={{ margin: '1px 0 0 0', fontSize: '13px', color: isReallyOnline(user)? '#10b981' : '#999', fontWeight: 600 }}>{isReallyOnline(user)? 'Online' : 'Offline'}</p>
              </div>
              
              {isFriend ? (
                <button style={{ background: '#e6f9e6', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }} title="Friends">
                  <Check size={20} color="#10b981" strokeWidth={3} />
                </button>
              ) : isSent ? (
                <button style={{ background: '#f0f0f0', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }} title="Request sent">
                  <Clock size={18} color="#888" />
                </button>
              ) : (
                <button onClick={() => handleAddFriend(user)} disabled={sending === uid} style={{ background: '#e9e5ff', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: sending === uid ? 0.6 : 1 }}>
                  <UserPlus size={20} color="#8d31ce" />
                </button>
              )}

              <button onClick={() => router.push(`/chat/${user.uid || user.id}`)} style={{ background: '#f5f0ff', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MessageCircle size={20} color="#8d31ce" />
              </button>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
