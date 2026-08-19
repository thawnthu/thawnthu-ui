'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";

type FontSize = 'small' | 'medium' | 'large';

export default function SettingPage() {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode');
    const savedFont = localStorage.getItem('fontSize');
    if(savedDark!== null) setDark(JSON.parse(savedDark));
    if(savedFont) setFontSize(JSON.parse(savedFont));
  }, []);
  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem('fontSize', JSON.stringify(fontSize)); }, [fontSize]);

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${border}`}}>
        <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: text}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <h2 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Setting</h2>
        </Link>
      </div>

      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, marginBottom: '16px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '15px'}}>Dark Mode</span>
            <button onClick={()=>setDark(!dark)} style={{background: dark? accent : border, width: '50px', height: '28px', borderRadius: '14px', border: 'none', position: 'relative', cursor: 'pointer'}}>
              <div style={{background: 'white', width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', top: '3px', left: dark? '25px' : '3px', transition: '0.3s'}}></div>
            </button>
          </div>
        </div>

        <div style={{background: card, padding: '16px', borderRadius: '12px', border: `1px solid ${border}`}}>
          <span style={{fontSize: '15px', display: 'block', marginBottom: '10px'}}>Font Size</span>
          <div style={{display: 'flex', gap: '8px'}}>
            {(['small', 'medium', 'large'] as FontSize[]).map(size => (
              <button key={size} onClick={()=>setFontSize(size)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${fontSize === size? accent : border}`, background: fontSize === size? accent : 'transparent', color: fontSize === size? 'white' : text, fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize'}}>{size}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
