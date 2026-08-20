'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const bg = '#F8F9FA';
  const card = '#FFFFFF';
  const text = '#1A1A1A';
  const border = '#E9ECEF';
  const accent = '#8B2DCE';

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/chat'); // Login hlawhtlin chuan Chat ah kal nghal
    } catch (err: any) {
      setError("Email or Password a dik lo");
    }
    setLoading(false);
  };

  return (
    <div style={{background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
      <div style={{background: card, padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: `1px solid ${border}`}}>
        <h1 style={{fontSize: '28px', fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0', color: accent}}>MzApp</h1>
        <p style={{textAlign: 'center', color: '#6C757D', margin: '0 0 24px 0'}}>Login rawh le</p>
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            required
            style={{padding: '14px', borderRadius: '12px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '16px', outline: 'none'}}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            required
            style={{padding: '14px', borderRadius: '12px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '16px', outline: 'none'}}
          />
          
          {error && <p style={{color: 'red', textAlign: 'center', margin: 0}}>{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer'}}>
            {loading? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '20px', color: '#6C757D'}}>
          Account i la neilo mi? <Link href="/signup" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Sign Up rawh</Link>
        </p>
      </div>
    </div>
  )
}
