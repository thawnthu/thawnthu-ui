'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase"; // i firebase file path en la
import { useRouter } from 'next/navigation';

type User = {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Keimahni lo chu midang chiah lak chhuah nan
        const currentUser = auth.currentUser;
        const q = query(collection(db, "users"), where("uid", "!=", currentUser?.uid));
        const querySnapshot = await getDocs(q);
        
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data() as User);
        });
        setUsers(usersList);
      } catch (error) {
        console.log("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const openChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  }

  if(loading) return <p style={{textAlign: 'center'}}>Loading users...</p>
  if(users.length === 0) return <p style={{textAlign: 'center'}}>User dang an la awm lo</p>

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      {users.map(user => (
        <div key={user.uid} onClick={()=>openChat(user.uid)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', 
            background: dark? '#1a1a1c' : 'white', padding: '12px', borderRadius: '12px',
            cursor: 'pointer', border: `1px solid ${dark? '#2a2a2c' : '#e0e0e0'}`
          }}>
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=8B2DCE&color=fff`} 
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
