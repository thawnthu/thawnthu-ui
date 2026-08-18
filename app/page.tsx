'use client'
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    alert(`Login: ${email}`)
  }

  return (
    <main style={{padding: '20px', maxWidth: '400px', margin: '50px auto'}}>
      <h1 style={{textAlign: 'center'}}>Thawnthu App</h1>
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{width: '100%', padding: '10px', marginBottom: '10px'}}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{width: '100%', padding: '10px', marginBottom: '10px'}}
      />
      <button 
        onClick={handleLogin}
        style={{width: '100%', padding: '10px', background: 'black', color: 'white'}}
      >
        Login
      </button>
    </main>
  )
}
