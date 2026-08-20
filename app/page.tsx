'use client';
import { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#8B2DCE';
  const subtext = dark? '#a0a0a0' : '#666';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      if(err.code === 'auth/invalid-email') setError('Invalid email format');
      else if(err.code === 'auth/user-not-found') setError('No account found with this email');
      else if(err.code === 'auth/wrong-password') setError('Incorrect password');
      else setError('Login failed. Please try again');
    }
    setLoading(false);
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>

      {/* HEADER - STICKY PAIH + DOT 3 TI LANG CHIANG */}
      <div style={{
        background: card,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${border}`,
        position: 'relative', // sticky paih
        top: 0,
        zIndex: 10
      }} ref={menuRef}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0, color: accent}}>MzApp</h1>

        {/* DOT 3 BUTTON - LANG CHIANG TUR IN CIRCLE BG KA BELH */}
        <button onClick={()=>setShowMenu(!showMenu)} style={{background: '#f0f0f0', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"> {/* 32px -> 24px + stroke */}
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        {/* MENU */}
        {showMenu && (
          <div style={{position: 'absolute', top: '60px', right: '16px', background: card, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '190px', zIndex: 20, border: `1px solid ${border}`}}>
            <span onClick={()=>{router.push('/setting?back=/'); setShowMenu(false)}} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', fontWeight: '700', color: text}}>
              <span style={{fontSize: '20px'}}>⚙️</span> Setting
            </span>
            <hr style={{margin: '0 16px', border: 'none', borderBottom: `1px solid ${border}`}}/>
            <span onClick={()=>{router.push('/about?back=/'); setShowMenu(false)}} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', fontWeight: '700', color: text}}>
              <span style={{fontSize: '20px'}}>ℹ️</span> About
            </span>
            <hr style={{margin: '0 16px', border: 'none', borderBottom: `1px solid ${border}`}}/>
            <span onClick={()=>{router.push('/contact?back=/'); setShowMenu(false)}} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', fontWeight: '700', color: text}}>
              <span style={{fontSize: '20px'}}>📞</span> Contact Us
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{display: 'flex', justifyContent: 'center', padding: '24px 20px'}}>
        <div style={{width: '100%', maxWidth: '380px'}}>
          <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}}>

            <p style={{color: subtext, fontSize: '14px', marginBottom: '20px', marginTop: '8px'}}>Please Login to continue</p>

            {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}

            <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>

              {/* EMAIL INPUT */}
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>👤</span>
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
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>🔒</span>
                <input
                  type={showPass? "text" : "password"}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Password"
                  style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
                />
                {/* MIT THAI ICON */}
                <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2, display: 'flex'}}>
                  {showPass? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}>
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Link href="/forgot" style={{color: accent, fontSize: '14px', textDecoration: 'none', fontWeight: '600'}}>Forgot password?</Link>
              </div>

              {/* LOGIN BUTTON */}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '4px', boxShadow: `0 4px 15px ${accent}40`}}>
                {loading? "Loading..." : "Login"}
              </button>
            </div>

            <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: subtext}}>
              Don't have an account? <Link href="/signup" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
      }
