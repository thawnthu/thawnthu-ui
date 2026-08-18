'use client';
import { useState } from 'react';

export default function Home() {
  const [dark, setDark] = useState(true);
  return <div style={{background: dark ? '#000' : '#fff', color: dark ? '#fff' : '#000', minHeight: '100vh'}}>Test 123</div>
}
