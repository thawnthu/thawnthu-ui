'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    router.push(`${path}?back=/`);
    setShowMenu(false);
  }

  return (
    <div style={{background: '#f5f5f5', minHeight: '100vh', padding: '16px'}}>
      
      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative'}} ref={menuRef}>
        <h1 style={{color: '#8B5CF6', fontSize: '24px', fontWeight: '800', margin: 0}}>MzApp</h1>
        <button onClick={()=>setShowMenu(!showMenu)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
        {showMenu && (
          <div style={{position: 'absolute', top: '45px', right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '160px', zIndex: 10}}>
            <div onClick={()=>handleNav('/setting')} style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>⚙️ Setting</div>
            <div onClick={()=>handleNav('/about')} style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>ℹ️ About</div>
            <div onClick={()=>handleNav('/contact')} style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderTop: '1px solid #eee'}}>📞 Contact Us</div> {/* 1. HEI HI BELH */}
          </div>
        )}
      </div>

      {/* CARD - marginTop ka belh */}
      <div style={{background: 'white', padding: '24px', borderRadius: '16px', marginTop: '40px'}}> {/* 3. HEI HI 40px in ka ti hniam */}
        <p style={{color: '#888', marginBottom: '20px'}}>Please Login to continue</p>
        
        {/* INPUT - width 100% leh padding ka siam tha */}
        <div style={{display: 'flex', alignItems: 'center', background: '#f1f1f1', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', width: '100%', boxSizing: 'border-box'}}> {/* 2. HEI HI */}
          <span style={{marginRight: '10px'}}>👤</span>
          <input type="email" placeholder="Email" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px'}}/>
        </div>

        <div style={{display: 'flex', alignItems: 'center', background: '#f1f1f1', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', width: '100%', boxSizing: 'border-box'}}> {/* 2. HEI HI */}
          <span style={{marginRight: '10px'}}>🔒</span>
          <input type="password" placeholder="Password" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px'}}/>
          <span style={{marginLeft: '10px', cursor: 'pointer'}}>🚫</span>
        </div>

        <div style={{textAlign: 'right', marginBottom: '20px'}}>
          <a href="#" style={{color: '#8B5CF6', textDecoration: 'none', fontSize: '14px'}}>Forgot password?</a>
        </div>

        <button style={{width: '100%', padding: '16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'}}>Login</button>
        
        <p style={{textAlign: 'center', marginTop: '16px', color: '#888'}}>Don't have an account? <a href="#" style={{color: '#8B5CF6', fontWeight: '700'}}>Sign Up</a></p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
