'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function ChatPage() {
  const [search, setSearch] = useState('');
  // i chat list logic dah la

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* SEARCH CHAT - ding reng */}
      <div style={{ position: 'sticky', top: '130px', zIndex: 15, padding: '12px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '16px 16px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Search size={20} color="#888" />
          <input type="text" placeholder="Search chat..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '30px', textAlign: 'center', color: '#666' }}>
          Chat list la awm lo - search hi a ding reng tawh ang
        </div>
      </div>
    </div>
  );
}
