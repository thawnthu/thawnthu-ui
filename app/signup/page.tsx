'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setError('');
    // 1. CHECK KOSONG
    if(!name || !email || !password) return setError('Akim lo a awm');
    // 2. EMAIL CHECK
    if(!email.includes('@')) return setError('Email diklo');
    // 3. PASSWORD LENGTH
    if(password.length < 6) return setError('Password hi 6 character aia tlem lo tur');

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      // Users collection ah dah tel
      await setDoc(doc(db, "users", userCred.user.uid), { 
        uid: userCred.user.uid,
        name: name, 
        email: email 
      });
      router.push('/chat');
    } catch (err: any) {
      // FIREBASE ERROR CHECK ZAWNG ZAWNG
      if(err.code === 'auth/email-already-in-use') setError('Email hi a awm tawh');
      else if(err.code === 'auth/weak-password') setError('Password a chak tawk lo');
      else if(err.code === 'auth/invalid-email') setError('Email format dik lo');
      else setError('Error: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '80px auto'}}>
      <h1>Sign Up</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <input placeholder="I hming" value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle}/>
      <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
      <input placeholder="Password min 6" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle}/>
      <button onClick={handleSignup} disabled={loading} style={btnStyle}>{loading? 'Loading...' : 'Create Account'}</button>
      <p>Account i nei tawh? <Link href="/login">Login</Link></p>
    </div>
  )
}
const inputStyle = {width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}
const btnStyle = {width: '100%', padding: '12px', background: '#5865F2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700'}
