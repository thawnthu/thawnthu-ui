'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark] = useState(false); // I setting atangin la dawn nia. Tunah chuan false light mode
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#5865F2';
  const subtext = dark? '#a0a0a0' : '#666';

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 14px 14px 45px',
    borderRadius: '12px',
    border: `1px solid ${border}`,
    background: inputBg,
    color: text,
    fontSize: '15px',
    outline: 'none'
  };

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
      <div style={{background: card, padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: `1px solid ${border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>

        {/* 2. BACK ARROW + TITLE */}
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
          <button onClick={()=>router.back()} style={{background: 'none', border: 'none', fontSize: '24px', color: text, cursor: 'pointer'}}>←</button>
          <h1 style={{fontSize: '28px', fontWeight: '800', margin: 0}}>Login</h1>
        </div>

        {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}

        {/* 3. INPUT DESIGN MAWI ICON NEN */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

          {/* EMAIL INPUT */}
          <div style={{position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>👤</span>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Email"
              style={inputStyle}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div style={{position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>🔒</span>
            <input
              type={showPass? "text" : "password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Password"
              style={inputStyle}
            />
            <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>
              {showPass? '👁️' : '🙈'}
            </button>
          </div>

          {/* 4. FORGOT PASSWORD A DINGLAM TAWP */}
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '-8px'}}>
            <Link href="/forgot" style={{color: accent, fontSize: '14px', textDecoration: 'none', fontWeight: '600'}}>Password i theihnghilh?</Link>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '8px'}}>
            {loading? "Loading..." : "Login"}
          </button>
        </div>

        {/* SIGN UP LINK */}
        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: subtext}}>
          Account i la nei lo? <Link href="/signup" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
