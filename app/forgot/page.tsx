'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if(!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset link sent to your email');
      setEmail('');
    } catch (err: any) {
      if(err.code === 'auth/user-not-found') setError('No account found with this email');
      else if(err.code === 'auth/invalid-email') setError('Invalid email format');
      else setError('Failed to send reset link. Please try again');
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
        <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Forgot Password</h1>
      </div>

      {/* CONTENT */}
      <div style={{display: 'flex', justifyContent: 'center', padding: '24px 20px'}}>
        <div style={{width: '100%', maxWidth: '380px'}}>
          <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}}>

            <p style={{color: subtext, fontSize: '14px', marginBottom: '20px', marginTop: 0}}>
              Enter your email and we will send you a reset link
            </p>

            {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}
            {success && <p style={{color: '#4CAF50', fontSize: '14px', marginBottom: '12px'}}>{success}</p>}

            <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>

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

              {/* BUTTON PURPLE - LOGIN ANG CHIAH */}
              <button
                onClick={handleReset}
                disabled={loading}
                style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '4px', boxShadow: `0 4px 15px ${accent}40`}}>
                {loading? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: subtext}}>
              Remember password? <Link href="/login" style={{color: accent, fontWeight: '700', textDecoration: 'none'}}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
