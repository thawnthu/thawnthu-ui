// app/admin/page.tsx
"use client"; 

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase"; // ../ 2 a ngai
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Login check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
  if (!user) return <p>Admin tan chiah ani. Login hmasa rawh.</p>;

  return (
    <main style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
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
        <button type="submit" style={{ padding: "10px", background: "black", color: "white" }}>
          Save
        </button>
      </form>
    </main>
  );
}
