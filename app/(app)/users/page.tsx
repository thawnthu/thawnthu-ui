'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageCircle } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

type User = {
  id: string;
  uid: string;
  name: string;
  email: string;
  online?: boolean;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 6. Users signup tawh ho lakna - Firestore atang
  useEffect(() => {
    // Realtime a update tur
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as User));
      
      // Mahni account paih
      const filteredList = list.filter(u => u.uid !== auth.currentUser?.uid);
      setUsers(filteredList);
      setLoading(false);
    }, (err) => {
      console.log("Users fetch error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';
  const getColor = (name: string) => {
    const colors = ['#2563eb', '#ef4444', '#ff6b35', '#f59e0b', '#8d31ce'];
    return colors[(name?.length || 0) % colors.length];
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      
      {/* 2. SEARCH - Card chhung a awm lo, a sang zawk */}
      <div style={{ padding: '10px 12px', background: '#fff' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          background: '#f0f0f0', 
          padding: '16px 16px', // THLAK: 10px atang 16px ah (a chung hnuai lian zawk)
          borderRadius: '12px' 
        }}>
          <Search size={20} color="#888" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
          />
        </div>
      </div>

      {/* 3. CARD - A var in a luah zau zawk, gap tlem zawk */}
      <div style={{ padding: '0 8px 12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', background: '#fff' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>Loading users...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>
            {users.length === 0 ? 'Tumah an la signup lo / users collection ah data a awm lo' : 'No users found'}
          </p>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                padding: '14px 10px',
                borderBottom: '1px solid #f0f0f0', // border chauh, card shadow awm lo
              }}
            >
              {/* AVATAR */}
              <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => router.push(`/profile/${user.uid || user.id}`)} // 4. Profile ah kal
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: getColor(user.name),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                  }}
                >
                  {getInitial(user.name)}
                </div>
                {user.online && (
                  <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
                )}
              </div>

              {/* 4. HMING CLICK CHUAN PROFILE */}
              <div 
                style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => router.push(`/profile/${user.uid || user.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000' }}>{user.name}</p>
                  {user.online && <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>}
                </div>
                <p style={{ margin: '1px 0 0 0', fontSize: '13px', color: '#666' }}>{user.email}</p>
              </div>

              {/* 5. CHAT CLICK CHUAN CHAT */}
              <button
                onClick={() => router.push(`/chat/${user.uid || user.id}`)}
                style={{ background: '#f5f0ff', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <MessageCircle size={20} color="#8d31ce" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
