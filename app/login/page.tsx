'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    if(!email || !password) return setError('Akim lo a awm');

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/chat');
    } catch (err: any) {
      if(err.code === 'auth/user-not-found') setError('User an awm lo');
      else if(err.code === 'auth/wrong-password') setError('Password dik lo');
      else if(err.code === 'auth/invalid-email') setError('Email format dik lo');
      else setError('Login thei lo');
    }
    setLoading(false);
  }

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '80px auto'}}>
      <h1>Login</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
      <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle}/>
      <button onClick={handleLogin} disabled={loading} style={btnStyle}>{loading? 'Loading...' : 'Login'}</button>
      <p><Link href="/forgot">Password i theihnghilh?</Link></p>
      <p>Account i la nei lo? <Link href="/signup">Sign Up</Link></p>
    </div>
  )
}
const inputStyle = {width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}
const btnStyle = {width: '100%', padding: '12px', background: '#5865F2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700'}
