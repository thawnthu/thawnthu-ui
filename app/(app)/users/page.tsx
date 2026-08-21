'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MessageCircle, Circle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type User = {
  id: string;
  name: string;
  email: string;
  online?: boolean;
  photo?: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Demo data - Firestore la awm loh pawn a lang ang
  const demoUsers: User[] = [
    { id: '1', name: 'Rema Chhangte', email: 'rema@gmail.com', online: true },
    { id: '2', name: 'Zuali Hmar', email: 'zuali@gmail.com', online: true },
    { id: '3', name: 'Lalruata', email: 'ruata@gmail.com', online: false },
    { id: '4', name: 'Msi Pachuau', email: 'msi@gmail.com', online: true },
    { id: '5', name: 'Rintei Ralte', email: 'rintei@gmail.com', online: false },
    { id: '6', name: 'Muana Khawlhring', email: 'muana@gmail.com', online: true },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // I users collection atang a lak i duh chuan hemi hi uncomment rawh
        // const snap = await getDocs(collection(db, "users"));
        // const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        // setUsers(list);

        setUsers(demoUsers); // Tunah chuan demo kan hmang rih
      } catch (e) {
        console.log(e);
        setUsers(demoUsers);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getColor = (name: string) => {
    const colors = ['#8d31ce', '#2563eb', '#ff6b35', '#10b981', '#ef4444', '#f59e0b'];
    return colors[name.length % colors.length];
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={22} color="#000" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Users</h1>
        <span style={{ marginLeft: '6px', background: '#8d31ce', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
          {users.length}
        </span>
      </div>

      {/* SEARCH */}
      <div style={{ padding: '12px 16px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f0f0', padding: '10px 14px', borderRadius: '12px' }}>
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
          />
        </div>
      </div>

      {/* USER LIST */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Loading users...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No users found</p>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* AVATAR */}
              <div style={{ position: 'relative' }}>
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
                    fontWeight: '800',
                  }}
                >
                  {getInitial(user.name)}
                </div>
                {user.online && (
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  {user.online && <Circle size={8} fill="#10b981" color="#10b981" />}
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
              </div>

              {/* ACTION */}
              <button
                onClick={() => router.push(`/chat/${user.id}`)}
                style={{ background: '#f0f0ff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
