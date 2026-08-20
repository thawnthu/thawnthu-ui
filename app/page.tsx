'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{background: '#f5f5f5', minHeight: '100vh', padding: '16px'}}>
      
      {/* HEADER - 1. LINE RIN BELH */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0', marginBottom: '20px', position: 'relative'}} ref={menuRef}>
        <h1 style={{color: '#8B5CF6', fontSize: '24px', fontWeight: '800', margin: 0}}>MzApp</h1>
        <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
        
        {/* MENU - 2. LINE RIN + 3. GAP TI ZAU + BOLD */}
        {showMenu && (
          <div style={{position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '180px', zIndex: 10, fontWeight: '700'}}>
            <div onClick={()=>router.push('/setting?back=/')} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer'}}>⚙️ Setting</div> {/* 3. gap 14px */}
            <hr style={{margin: '0 16px', border: 'none', borderBottom: '1px solid #f0f0f0'}}/> {/* 2. LINE */}
            <div onClick={()=>router.push('/about?back=/')} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer'}}>ℹ️ About</div> {/* 3. gap 14px */}
            <hr style={{margin: '0 16px', border: 'none', borderBottom: '1px solid #f0f0f0'}}/> {/* 2. LINE */}
            <div onClick={()=>router.push('/contact?back=/')} style={{padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer'}}>📞 Contact Us</div>
          </div>
        )}
      </div>

      {/* CARD */}
      <div style={{background: 'white', padding: '24px', borderRadius: '16px'}}>
        <p style={{color: '#888', marginBottom: '20px'}}>Please Login to continue</p>
        
        {/* EMAIL INPUT */}
        <div style={{display: 'flex', alignItems: 'center', background: '#f1f1f1', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px'}}> 
          <span style={{marginRight: '10px', fontSize: '18px'}}>👤</span>
          <input type="email" placeholder="Email" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px'}}/>
        </div>

        {/* PASSWORD INPUT - 4. MIT LEM NALH */}
        <div style={{display: 'flex', alignItems: 'center', background: '#f1f1f1', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px'}}>
          <span style={{marginRight: '10px', fontSize: '18px'}}>🔒</span>
          <input type={showPassword ? "text" : "password"} placeholder="Password" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px'}}/>
          <span onClick={()=>setShowPassword(!showPassword)} style={{marginLeft: '10px', cursor: 'pointer'}}>
            {showPassword ? 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> : 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.09 2.09C10.13 7.13 11.04 7 12 7zM11.1 13H12c.55 0 1-.45 1-1v-.1l-1.9-1.9c-.45.24-.8.6-1.1 1.01l-.2-.2zM3 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 3 4.27z"/></svg>
            }
          </span>
        </div>

        <div style={{textAlign: 'right', marginBottom: '20px'}}>
          <a href="#" style={{color: '#8B5CF6', textDecoration: 'none', fontSize: '14px', fontWeight: '700'}}>Forgot password?</a> {/* 5. BOLD */}
        </div>

        <button style={{width: '100%', padding: '16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'}}>Login</button>
        
        <p style={{textAlign: 'center', marginTop: '16px', color: '#888'}}>Don't have an account? <a href="#" style={{color: '#8B5CF6', fontWeight: '700'}}>Sign Up</a></p>
      </div>
    </div>
  )
}
