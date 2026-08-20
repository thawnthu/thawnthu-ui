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
  const [dark] = useState(false);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#8B2DCE'; // Purple
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

      <div style={{width: '100%', maxWidth: '380px'}}>

        {/* 1. ARROW + LOGIN TITLE HI CLASS PAWN AH */}
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', paddingLeft: '4px'}}>
          <button onClick={()=>router.back()} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{fontSize: '28px', fontWeight: '800', margin: 0}}>Login</h1>
        </div>

        <p style={{color: subtext, fontSize: '14px', marginBottom: '20px', paddingLeft: '4px'}}>Please Login to continue</p>

        {/* 2. CLASS/ CARD CHHUNGAH CHUAN FORM CHIAH */}
        <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}}>

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
              {/* EYE ICON */}
              <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
                {showPass? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}>
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}>
                    <path d="M12 7c2.76 0 5 2.24 5 5 0.65-.13 1.26-.36 1.81l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.73-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.09 2.09C10.13 7.13 11.04 7 12 7zM11.1 13.18l2.72-2.72c-.06-.12-.12-.25-.18-.37l-1.97 1.97c-.02.05-.03.11-.05.17l-.52.52zm4.89 4.89l1.97-1.97c.13-.09.26-.19.38-.28L17.6 15.1c-.24.45-.54.87-.9 1.24L14.99 18.1zm-6.07-7.32l-4.27-4.27c-1.1.7-2.1 1.58-2.95 2.59C2.73 7.61 1 12 1 12s3.11 7.5 11 7.5c1.4 0 2.74-.25 3.98-.7l-2.09-2.09c-.75.18-1.54.27-2.36.27-2.76 0-5-2.24-5-5 0-.83.2-1.61.55-2.31zM12 4.5C7 4.5 2.73 7.61 1 12c.21.54.46 1.06.73 1.55L6.97 9.3c-.07-.32-.1-.65-.1-1 0-1.66 1.34-3 3-3.36 0.7.05 1.02.14L12 4.5z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Link href="/forgot" style={{color: accent, fontSize: '14px', textDecoration: 'none', fontWeight: '600'}}>Forgot password?</Link>
            </div>

            {/* BUTTON PURPLE */}
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
    </div>
  )
}
