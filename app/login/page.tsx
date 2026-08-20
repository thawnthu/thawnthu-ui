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
  const [dark] = useState(false); // setting atangin la dawn nia
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#8B2DCE'; // 5. BUTTON PURPLE I THAWN ANG KHA
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

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>

      {/* 2. CLASS CHHUNGAH AWM VEK */}
      <div style={{background: card, padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '380px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}}>

        {/* 1. ARROW LIAN + TITLE */}
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px'}}>
          <button onClick={()=>router.back()} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{fontSize: '28px', fontWeight: '800', margin: 0}}>Login</h1>
        </div>

        {/* 6. TEXT BELH */}
        <p style={{color: subtext, fontSize: '14px', marginBottom: '20px'}}>Please Login to continue</p>

        {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}

        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>

          {/* EMAIL INPUT */}
          <div style={{position: 'relative'}}>
            <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>👤</span>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Email"
              style={{width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div style={{position: 'relative'}}>
            <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>🔒</span>
            <input
              type={showPass? "text" : "password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Password"
              style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
            />
            {/* 4. EYE ICON MIT THAI CHHIA */}
            <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>
              {showPass? '👁️' : '🙈'}
            </button>
          </div>

          {/* 3. FORGOT PASSWORD A DINGLAM */}
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Link href="/forgot" style={{color: accent, fontSize: '14px', textDecoration: 'none', fontWeight: '600'}}>Forgot password?</Link>
          </div>

          {/* 5. LOGIN BUTTON PURPLE */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '4px', boxShadow: `0 4px 15px ${accent}40`}}>
            {loading? "Loading..." : "Sign In"}
          </button>
        </div>

        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: subtext}}>
          Account i la nei lo? <Link href="/signup" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
