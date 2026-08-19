// app/admin/page.tsx
"use client"; 

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login a fail. Email/Password dik lo");
    }
  };

  // Logout
  const handleLogout = () => signOut(auth);

  // Thawnthu thar dahna
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Title leh Content dah rawh");

    try {
      await addDoc(collection(db, "thawnthu"), {
        title,
        content,
        createdAt: Timestamp.now(),
        authorId: user.uid,
      });
      alert("Thawnthu a in save e!");
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("Error a awm");
    }
  };

  if (loading) return <p>Loading...</p>;

  // LOGIN LO ANIH CHUAN
  if (!user) return (
    <main style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px" }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px", background: "black", color: "white" }}>
          Login
        </button>
      </form>
    </main>
  );

  // LOGIN FEL CHUAN
  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <p>Welcome: {user.email}</p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <h2>Thawnthu Thar Dah</h2>
        <input 
          type="text" 
          placeholder="Thawnthu Hming" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px" }}
        />
        <textarea 
          placeholder="Thawnthu Chhung" 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          style={{ padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px", background: "green", color: "white" }}>
          Save
        </button>
      </form>
    </main>
  );
                                     }
