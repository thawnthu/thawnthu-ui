
'use client';
import { useRouter, useSearchParams } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backTo = searchParams.get('back') || '/';

  const bg = '#F8F9FA';
  const card = '#FFFFFF';
  const text = '#1A1A1A';
  const border = '#E9ECEF';

  return (
    <div style={{background: bg, color: text, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      <div style={{flexShrink: 0, background: card, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `1px solid ${border}`}}>
        <button onClick={()=>router.push(backTo)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={text}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>Contact Us</h1>
      </div>
      <div style={{flexGrow: 1, overflowY: 'auto', padding: '16px'}}>
        <div style={{background: card, padding: '24px', borderRadius: '20px', border: `1px solid ${border}`}}>
          Contact Us Page content
        </div>
      </div>
    </div>
  )
}
