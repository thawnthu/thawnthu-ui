'use client'
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/post') // Login hnu ah post page ah a kal ang
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/post')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main style={{padding: '20px', maxWidth: '400px', margin: '100px auto', border: '1px solid #ddd', borderRadius: '12px'}}>
      <h1 style={{textAlign: 'center'}}>Post Tu Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px'}}/>
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '15px'}}/>
      <button onClick={handleLogin} style={{width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', marginBottom: '10px'}}>Login</button>
      <button onClick={handleRegister} style={{width: '100%', padding: '12px', background: '#555', color: 'white', border: 'none'}}>Account Siam</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </main>
  )
  }
