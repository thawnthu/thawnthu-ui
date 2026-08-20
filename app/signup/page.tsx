'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark] = useState(false);
  const router = useRouter();

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#8B2DCE'; // Login nen a in ang
  const subtext = dark? '#a0a0a0' : '#666';

  const handleSignup = async () => {
    setError('');
    if(password!== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if(password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/');
    } catch (err: any) {
      if(err.code === 'auth/email-already-in-use') setError('Email already in use');
      else if(err.code === 'auth/invalid-email') setError('Invalid email format');
      else setError('Signup failed. Please try again');
    }
    setLoading(false);
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>

      {/* STICKY HEADER - LOGIN ANG CHIAH */}
      <div style={{
        background: card,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: `1px solid ${border}`,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={()=>router.back()} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Sign Up</h1>
      </div>

      {/* CONTENT */}
      <div style={{display: 'flex', justifyContent: 'center', padding: '24px 20px'}}>
        <div style={{width: '100%', maxWidth: '380px'}}>
          <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}}>

            <p style={{color: subtext, fontSize: '14px', marginBottom: '20px', marginTop: 0}}>Create your account to continue</p>

            {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}

            <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>

              {/* NAME INPUT */}
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder="Full Name"
                  style={{width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
                />
              </div>

              {/* EMAIL INPUT */}
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>✉️</span>
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
                  placeholder="Password min 6"
                  style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
                />
                <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2, display: 'flex'}}>
                  {showPass? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
              </div>

              {/* CONFIRM PASSWORD INPUT */}
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>🔒</span>
                <input
                  type={showConfirmPass? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}
                />
                <button onClick={()=>setShowConfirmPass(!showConfirmPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2, display: 'flex'}}>
                  {showConfirmPass? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
              </div>

              {/* BUTTON PURPLE - LOGIN ANG CHIAH */}
              <button
                onClick={handleSignup}
                disabled={loading}
                style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '4px', boxShadow: `0 4px 15px ${accent}40`}}>
                {loading? "Creating..." : "Create Account"}
              </button>
            </div>

            <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: subtext}}>
              Already have an account? <Link href="/login" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
