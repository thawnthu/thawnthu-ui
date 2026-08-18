'use client'
import { useState } from 'react';
import { auth } from './lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert('Login a hlawhtling!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main style={{padding: '20px', maxWidth: '400px', margin: '100px auto', border: '1px solid #ccc', borderRadius: '8px'}}>
      <h1 style={{textAlign: 'center'}}>Thawnthu App</h1>
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box'}}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box'}}
      />
      <button 
        onClick={handleLogin}
        style={{width: '100%', padding: '10px', background: 'black', color: 'white', border: 'none', borderRadius: '4px'}}
      >
        Login
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </main>
  )
}
