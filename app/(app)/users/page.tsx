'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageCircle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      const filteredList = list.filter(u => u.uid !== auth.currentUser?.uid);
      setUsers(filteredList);
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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      
      {/* SEARCH */}
      <div style={{ padding: '12px 12px 12px 12px' }}>
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
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
          />
        </div>
      </div>

      {/* THLAKNA: SIR KIL KUAL - search input ang chiah */}
      <div style={{ 
        margin: '0 12px', 
        background: '#fff', 
        borderRadius: '14px',  // HEI HI A KUAL NA - search ang tho
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>Loading users...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>No users found</p>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                padding: '14px 14px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => router.push(`/profile/${user.uid || user.id}`)}
              >
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: getColor(user.name), color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: '700',
                  }}>
                  {getInitial(user.name)}
                </div>
                {user.online && (
                  <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
                )}
              </div>

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
