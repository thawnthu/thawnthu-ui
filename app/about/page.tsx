import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{background: '#f5f5f5', minHeight: '100vh'}}>
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid #e0e0e0`}}>
        <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#000'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <h2 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>About</h2>
        </Link>
      </div>
      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <div style={{background: '#fff', padding: '16px', borderRadius: '12px'}}>
          <h3>Thawnthu V2</h3>
          <p>Mizo thawnthu chhiarna website. Tunlai thawnthu thar leh hluite i chhiar theihna.</p>
        </div>
      </div>
    </div>
  )
}
