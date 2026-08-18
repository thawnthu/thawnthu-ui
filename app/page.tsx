'use client'
import { useState } from 'react';

export default function HomePage() {
  const [msg] = useState('Thawnthu a tluang e ✅')
  return (
    <main style={{padding: '20px', background: '#f8f9fa', minHeight: '100vh'}}>
      <h1 style={{fontSize: '24px', fontWeight: '800'}}>{msg}</h1>
    </main>
  )
}
