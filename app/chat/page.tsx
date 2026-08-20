'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(3);
  const [dark] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const subtext = dark? '#a0a0a0' : '#666';
  const iconColor = text;

  const menuItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '15px',
    cursor: 'pointer',
    color: text,
    fontWeight: '700'
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', paddingBottom: '80px'}}>

      {/* 1. HEADER - HOME ANG CHIAH */}
      <div style={{background: card, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu</h1>

        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          {/* SEARCH ICON */}
          <button onClick={()=>setSearchOpen(!searchOpen)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* DOT 3 MENU */}
          <div style={{position: 'relative'}} ref={menuRef}>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor}>
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
            {menuOpen && (
              <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', width: '200px', zIndex: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.15)'}}>
                <Link href="/setting" style={{textDecoration: 'none'}}>
                  <button style={menuItemStyle}><span style={{fontSize: '20px'}}>⚙️</span><span>Setting</span></button>
                </Link>
                <hr style={{margin: '0', border: 'none', borderTop: `1px solid ${border}`}}/>
                <Link href="/contact" style={{textDecoration: 'none'}}>
                  <button style={menuItemStyle}><span style={{fontSize: '20px'}}>📞</span><span>Contact Us</span></button>
                </Link>
                <hr style={{margin: '0', border: 'none', borderTop: `1px solid ${border}`}}/>
                <Link href="/about" style={{textDecoration: 'none'}}>
                  <button style={menuItemStyle}><span style={{fontSize: '20px'}}>ℹ️</span><span>About</span></button>
                </Link>
                <hr style={{margin: '0', border: 'none', borderTop: `1px solid ${border}`}}/>
                {user? (
                  <button onClick={handleLogout} style={menuItemStyle}><span style={{fontSize: '20px'}}>🚪</span><span>Logout</span></button>
                ) : (
                  <Link href="/login" style={{textDecoration: 'none'}}>
                    <button onClick={()=>setMenuOpen(false)} style={menuItemStyle}><span style={{fontSize: '20px'}}>🔑</span><span>Login</span></button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      {searchOpen && (
        <div style={{padding: '12px 16px', background: card, borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'center'}}>
          <input
            value={searchText}
            onChange={(e)=>setSearchText(e.target.value)}
            placeholder="Chat zawng rawh..."
            autoFocus
            style={{width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, outline: 'none'}}
          />
        </div>
      )}

      {/* 2. CHAT ROOM CONTENT */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: '20px'}}>
        <p style={{color: subtext, fontSize: '16px', textAlign: 'center'}}>Beisei sawi rawh u</p>
        {/* Hetah hian private chat list i dah dawn nia boss */}
      </div>

      {/* 3. FOOTER - HOME ANG CHIAH, CHAT HI ACTIVE */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}>
          <button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}>
            <span style={{fontSize: '22px'}}>🏠</span>Home
          </button>
        </Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}>
          <button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}>
            <span style={{fontSize: '22px'}}>📂</span>Category
          </button>
        </Link>
        <Link href="/chat" style={{textDecoration: 'none', flex: 1}}>
          <button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700'}}>
            <span style={{fontSize: '22px'}}>💬</span>Chat
          </button>
        </Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}>
          <button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', width: '100%', padding: '8px 0', fontWeight: '700', position: 'relative'}}>
            <span style={{fontSize: '22px'}}>🔔</span>Notification
            {notifCount > 0 && <span style={{position: 'absolute', top: '4px', right: '25%', background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'}}>{notifCount}</span>}
          </button>
        </Link>
      </div>
    </div>
  )
}
