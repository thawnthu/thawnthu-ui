'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError(''); setMsg('');
    if(!email) return setError('Email dah rawh');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Email ah link kan thawn tawh');
    } catch (err: any) {
      if(err.code === 'auth/user-not-found') setError('Email hi a awm lo');
      else setError('Error awm');
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '80px auto'}}>
      <h1>Forgot Password</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {msg && <p style={{color: 'green'}}>{msg}</p>}
      <input placeholder="I email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
      <button onClick={handleReset} style={btnStyle}>Reset Link Send</button>
      <p><Link href="/login">Login lamah kir</Link></p>
    </div>
  )
}
const inputStyle = {width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}
const btnStyle = {width: '100%', padding: '12px', background: '#5865F2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700'}
