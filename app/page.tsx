'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  status: string; // pending, approved
  createdAt: Timestamp;
}

const CATEGORIES = ['Pasaltha', 'Fiamthu', 'Love Story', 'Sual lam', 'Nula palai', 'General'];

export default function Home() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // FORM STATE
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // FIREBASE ATANGA DATA LAK - "approved" chiah kan la
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs
         .map(doc => ({ id: doc.id,...doc.data() })) as Post[];
        // approved chiah lang tir
        setPosts(postsData.filter(p => p.status === 'approved'));
      } catch (err) {
        console.log(err)
      }
      setLoading(false);
    };
    fetchPosts();
  }, [submitting]); // Post thar a awm chuan refresh

  // POST THAWM THEHLUT NA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title ||!content) return alert("Title leh Thu kim lo");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        category,
        author: author || "Anonymous",
        status: "pending", // Admin approve hnu ah a lang
        createdAt: Timestamp.now(),
      });
      alert("I thu i thehlut e! Admin in a approve hnu ah a lang ang");
      setTitle(""); setContent(""); setAuthor("");
      setPage('home'); // Home ah kir leh
    } catch (err) {
      alert("Error: " + err)
    }
    setSubmitting(false);
  };

  const categories = CATEGORIES.map(name => ({
    name,
    count: posts.filter(p => p.category === name).length
  }));

  const timeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const inputBg = dark? '#2a2a2c' : '#f0f0f0';

  const toggleDark = () => {
    setDark(!dark);
    setMenuOpen(false);
  };

  const NavButton = ({icon, label, p}: {icon: string, label: string, p: string}) => (
    <button onClick={()=>{setPage(p); setMenuOpen(false)}} style={{
      background: 'none', border: 'none', color: page===p? accent : subtext,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontSize: '12px', fontWeight: '700', cursor: 'pointer', flex: 1, padding: '8px 0'
    }}>
      <span style={{fontSize: '22px', marginBottom: '4px'}}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif'}}>

      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: bg, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu v2</h1>
        <div style={{position: 'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer', lineHeight: 1}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 20}}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>{dark? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, overflowY: 'auto', paddingBottom: '80px'}}>

        {/* HOME PAGE */}
        {page === 'home' && (
          <>
            {loading? <p style={{padding: '20px'}}>Loading...</p> :
            posts.length === 0? <p style={{padding: '20px'}}>Post ala awm lo</p> :
            posts.map((p)=>(
              <div key={p.id} style={{background: card, margin: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
                <span style={{fontSize: '12px', background: border, padding: '6px 10px', borderRadius: '8px', fontWeight: '600'}}>{p.category}</span>
                <h3 style={{margin: '12px 0 8px 0', fontSize: '18px', fontWeight: '700'}}>{p.title}</h3>
                <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>{p.content.substring(0,150)}...</p>
                <p style={{margin: 0, fontSize: '12px', color: subtext}}>{p.author} • {timeAgo(p.createdAt)}</p>
              </div>
            ))}
            }
          </>
        )}

        {/* POST PAGE - HEI HI A THAR */}
        {page === 'post' && (
          <form onSubmit={handleSubmit} style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h2 style={{fontSize: '22px', marginBottom: '20px'}}>Thu Thehlut</h2>

            <input
              placeholder="I Hming"
              value={author}
              onChange={e=>setAuthor(e.target.value)}
              style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}
            />

            <select
              value={category}
              onChange={e=>setCategory(e.target.value)}
              style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <input
              placeholder="Thawnthu Hming"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}
            />

            <textarea
              placeholder="I thu ziak rawh..."
              value={content}
              onChange={e=>setContent(e.target.value)}
              rows={10}
              style={{width: '100%', padding: "12px", marginBottom: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: '8px', color: text}}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{width: '100%', padding: "14px", background: accent, color: "white", border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer'}}
            >
              {submitting? "Thehluh mek..." : "Thehlut"}
            </button>
          </form>
        )}

        {/* CATEGORY PAGE */}
        {page === 'category' && (
          <div style={{padding: '12px'}}>
            {categories.map((c,i)=>(
              <div key={i} style={{background: card, margin: '10px 0', padding: '16px', borderRadius: '12px', border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '16px', fontWeight: '700'}}>{c.name}</span>
                <span style={{fontSize: '14px', color: subtext}}>{c.count} posts</span>
              </div>
            ))}
          </div>
        )}

        {page === 'about' && (
          <div style={{padding: '30px 20px', textAlign: 'center'}}>
            <h2 style={{fontSize: '24px'}}>Thawnthu App</h2>
            <p style={{color: subtext, marginTop: '12px'}}>Mizo thawnthu chhiar nan</p>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <NavButton icon="🏠" label="Home" p="home"/>
        <NavButton icon="📂" label="Category" p="category"/>
        <NavButton icon="✍️" label="Post" p="post"/>
        <NavButton icon="🔔" label="Notify" p="notification"/>
      </div>
    </div>
  )
              }
