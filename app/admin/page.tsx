"use client";
import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey!== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setMsg("Admin Key a dik lo!");
      return;
    }
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        createdAt: Timestamp.now(),
        adminKey: adminKey
      });
      setMsg("Post a hlawhtling!");
      setTitle("");
      setContent("");
    } catch (err) {
      setMsg("Error a awm");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post Thar Dahna</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          placeholder="Admin Key"
          className="border p-2 rounded"
          type="password"
        />
        <input 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 rounded"
          required
        />
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Thawnthu ziak rawh..."
          className="border p-2 rounded h-40"
          required
        />
        <button className="bg-black text-white p-2 rounded">Post</button>
        {msg && <p>{msg}</p>}
      </form>
    </main>
  );
}
