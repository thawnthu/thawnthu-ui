'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

type FontSize = 'small' | 'medium' | 'large';

function SettingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backTo = searchParams.get('back') || '/';

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
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${border}`, background: bg, position: 'sticky', top: 0}}>
        <button onClick={()=>router.push(backTo)} style={{display: 'flex', alignItems: 'center', textDecoration: 'none', color: text, background: 'none', border: 'none', cursor: 'pointer'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Setting</h2>
      </div>

      <div style={{padding: '16px'}}>
        <div style={{background: card, borderRadius: '12px', border: `1px solid ${border}`, overflow: 'hidden'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span style={{fontSize: '15px', fontWeight: '500'}}>Dark Mode</span>
            </div>
            <button onClick={()=>setDark(!dark)} style={{background: dark? accent : border, width: '50px', height: '28px', borderRadius: '14px', border: 'none', position: 'relative', cursor: 'pointer'}}>
              <div style={{background: 'white', width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', top: '3px', left: dark? '25px' : '3px', transition: '0.3s'}}></div>
            </button>
          </div>
          <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '0 16px'}}/>
          <div style={{padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
              <span style={{fontSize: '15px', fontWeight: '500'}}>Font Size</span>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button key={size} onClick={()=>setFontSize(size)}
                  style={{flex: 1, padding: '10px', borderRadius: '8px', border: `1.5px solid ${fontSize === size? accent : border}`, background: fontSize === size? accent : 'transparent', color: fontSize === size? 'white' : text, fontWeight: '600', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize'}}
                >{size}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingPage() {
  return (
    <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
      <SettingContent />
    </Suspense>
  )
}
