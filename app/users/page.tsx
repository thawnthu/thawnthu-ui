'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from 'next/navigation';

type User = {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });
      setUsers(usersList);
    }
    fetchUsers();
  }, []);

  const openChat = (userId: string) => {
    router.push(`/chat/${userId}`); // Chat page ah a kal
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      {users.map(user => (
        <div key={user.uid} onClick={()=>openChat(user.uid)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', 
            background: 'white', padding: '12px', borderRadius: '12px',
            cursor: 'pointer', border: '1px solid #e0e0e0'
          }}>
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName}
            style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover'}} // bial
          />
          <div>
            <p style={{margin: 0, fontWeight: '700', fontSize: '16px'}}>{user.displayName}</p>
            <p style={{margin: 0, fontSize: '13px', color: '#666'}}>{user.email}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
