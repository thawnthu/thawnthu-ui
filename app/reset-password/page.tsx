'use client';
import { useState, useEffect, Suspense } from 'react'; // Suspense belh
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 1. UI CHIAH HEI HI
function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [oobCode, setOobCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams(); // HEI HI SUSPENSE AH AWM TUR

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    setDark(saved === 'true');

    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      verifyPasswordResetCode(auth, code).catch(() => {
        setError('This password reset link is invalid or has expired');
      });
    } else {
      setError('Invalid reset link');
    }
  }, [searchParams]);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';
  const accent = '#8B2DCE';
  const subtext = dark? '#a0a0a0' : '#666';

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword!== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Password reset successful! Please Login');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if(err.code === 'auth/expired-action-code') setError('This link has expired. Please request a new one');
      else if(err.code === 'auth/invalid-action-code') setError('Invalid link. Please request a new reset link');
      else setError('Failed to reset password. Please try again');
    }
    setLoading(false);
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', transition: '0.3s'}}>
      <div style={{background: card, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10, transition: '0.3s'}}>
        <button onClick={()=>router.back()} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Reset Password</h1>
      </div>

      <div style={{display: 'flex', justifyContent: 'center', padding: '24px 20px'}}>
        <div style={{width: '100%', maxWidth: '380px'}}>
          <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', transition: '0.3s'}}>
            <p style={{color: subtext, fontSize: '14px', marginBottom: '20px', marginTop: 0}}>Reset your password</p>
            {error && <p style={{color: 'red', fontSize: '14px', marginBottom: '12px'}}>{error}</p>}
            <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>🔒</span>
                <input type={showPass? "text" : "password"} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New Password" style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2, display: 'flex'}}>
                  {showPass? (<svg width="22" height="22" viewBox="0 0 24 24" fill={accent}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>)}
                </button>
              </div>
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', zIndex: 1}}>🔒</span>
                <input type={showConfirmPass? "text" : "password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm Password" style={{width: '100%', padding: '14px 45px 14px 45px', borderRadius: '12px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '15px', outline: 'none', boxSizing: 'border-box'}}/>
                <button onClick={()=>setShowConfirmPass(!showConfirmPass)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 2, display: 'flex'}}>
                  {showConfirmPass? (<svg width="22" height="22" viewBox="0 0 24 24" fill={accent}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>) : (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>)}
                </button>
              </div>
              <button onClick={handleResetPassword} disabled={loading} style={{background: accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '4px', boxShadow: `0 4px 15px ${accent}40`, opacity: loading? 0.7 : 1}}>
                {loading? "Loading..." : "Reset Password"}
              </button>
              {success && <p style={{color: '#22c55e', fontSize: '14px', marginTop: '4px', marginBottom: '0', fontWeight: '700', textAlign: 'center'}}>Password reset successful! Please <Link href="/" style={{color: accent, fontWeight: '800', textDecoration: 'none'}}>Login</Link></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. EXPORT PANGNGAI HI SUSPENSE IN KAN KUNG
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
