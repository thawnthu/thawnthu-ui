'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Post = { id: string; title: string; content: string; category: string; author: string; createdAt: any; }

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likes, setLikes] = useState<{[key: string]: boolean}>({}); // toggle atan
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showCommentBox, setShowCommentBox] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const q = query(collection(db, "posts"), where("category", "==", categoryName));
      const snapshot = await getDocs(q);
      let postsData = snapshot.docs.map(doc => ({ id: doc.id,...doc.data() })) as Post[];
      postsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setPosts(postsData);
      setLoading(false);
    };
    fetchPosts();
  }, [categoryName]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copy tawh e!");
  }

  // 2. LIKE TOGGLE
  const handleLike = (id: string, e: any) => {
    e.stopPropagation();
    setLikes(prev => ({...prev, [id]:!prev[id]}));
  }

  // 2. COMMENT BOX SHOW/HIDE + ADD
  const handleCommentClick = (id: string, e: any) => {
    e.stopPropagation();
    setShowCommentBox(prev => ({...prev, [id]:!prev[id]}));
  }
  const submitComment = (id: string) => {
    if(!commentText[id]) return;
    setCommentCounts(prev => ({...prev, [id]: (prev[id] || 0) + 1}));
    setCommentText(prev => ({...prev, [id]: ''}));
  }

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';
  const toggleDark = () => setDark(!dark);

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, background: bg, zIndex: 20}}>
        <h1 style={{fontSize: '24px', fontWeight: '800', margin: 0}}>Thawnthu V2</h1>
        <div style={{position: 'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer'}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px 0', minWidth: '180px'}}>
              <button onClick={toggleDark} style={{display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px'}}>{dark? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
              <Link href="/about" style={{display: 'block', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>ℹ️ About</Link>
              <Link href="/contact" style={{display: 'block', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>📞 Contact</Link>
            </div>
          )}
        </div>
      </div>

      {/* 1. --- HI A LAI TAKAH ALIGN */}
      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Link href="/category" style={{fontSize: '20px', color: accent, textDecoration: 'none', lineHeight: '20px', fontWeight: '800', display: 'flex', alignItems: 'center'}}>---</Link>
        <h2 style={{fontSize: '20px', fontWeight: '800', margin: 0}}>{categoryName}</h2>
      </div>

      <div style={{padding: '0 12px 80px 12px'}}>
        {loading? <p style={{padding: '0 4px'}}>Loading...</p> :
        posts.length === 0? <p style={{padding: '0 4px'}}>He category ah hian post ala awm lo</p> :
        posts.map((p)=>(
          <div key={p.id} style={{background: card, margin: '12px 0', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: '700'}}>{p.title}</h3>
              <button onClick={()=>copyText(p.content)} style={{background: border, color: text, border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'}}>📋 Copy</button>
            </div>

            <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '8px 0'}}/>
            <p style={{margin: '0 0 12px 0', fontSize: '14px'}}>
              {p.content.substring(0,200)}...
              <button onClick={()=>setSelectedPost(p)} style={{background: 'none', border: 'none', color: accent, fontSize: '14px', fontWeight: '700', cursor: 'pointer', padding: '0 0 0 4px'}}>Read more</button>
            </p>

            {/* 2. LIKE COMMENT SIAMTHAT */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: subtext}}>
              <span>{p.author} • {timeAgo(p.createdAt)}</span>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={(e)=>handleLike(p.id, e)} style={{background: 'none', border: 'none', color: likes[p.id]? accent : subtext, cursor: 'pointer', fontWeight: '700'}}>({likes[p.id]? 1 : 0})❤️</button>
                <button onClick={(e)=>handleCommentClick(p.id, e)} style={{background: 'none', border: 'none', color: subtext, cursor: 'pointer', fontWeight: '700'}}>({commentCounts[p.id] || 0})💬</button>
              </div>
            </div>

            {/* COMMENT BOX */}
            {showCommentBox[p.id] && (
              <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  placeholder="Comment ziak rawh..."
                  value={commentText[p.id] || ''}
                  onChange={(e)=>setCommentText(prev=>({...prev, [p.id]: e.target.value}))}
                  style={{flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text}}
                />
                <button onClick={()=>submitComment(p.id)} style={{background: accent, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px'}}>Send</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FULL POST MODAL */}
      {selectedPost && (
        <div onClick={()=>setSelectedPost(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, padding: '20px', overflowY: 'auto'}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background: card, borderRadius: '16px', padding: '20px', maxWidth: '700px', margin: '40px auto'}}>
            <h2 style={{margin: '0 0 8px 0'}}>{selectedPost.title}</h2>
            <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '8px 0'}}/>
            <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{selectedPost.content}</p>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px'}}>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={(e)=>handleLike(selectedPost.id, e)} style={{background: border, color: likes[selectedPost.id]? accent : text, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}>({likes[selectedPost.id]? 1 : 0})❤️</button>
                <button onClick={(e)=>handleCommentClick(selectedPost.id, e)} style={{background: border, color: text, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}>({commentCounts[selectedPost.id] || 0})💬</button>
              </div>
              <button onClick={()=>setSelectedPost(null)} style={{background: border, color: text, border: 'none', padding: '10px 16px', borderRadius: '8px'}}>Close</button>
            </div>

            {/* FULL MODAL AH PAWN COMMENT BOX */}
            {showCommentBox[selectedPost.id] && (
              <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  placeholder="Comment ziak rawh..."
                  value={commentText[selectedPost.id] || ''}
                  onChange={(e)=>setCommentText(prev=>({...prev, [selectedPost.id]: e.target.value}))}
                  style={{flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text}}
                />
                <button onClick={()=>submitComment(selectedPost.id)} style={{background: accent, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px'}}>Send</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{background: card, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-around', position: 'fixed', bottom: 0, width: '100%'}}>
        <Link href="/" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🏠</span>Home</button></Link>
        <Link href="/category" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>📂</span>Category</button></Link>
        <Link href="/post" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>✍️</span>Post</button></Link>
        <Link href="/notification" style={{textDecoration: 'none', flex: 1}}><button style={{background: 'none', border: 'none', color: subtext, display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', fontWeight: '700', width: '100%', padding: '8px 0'}}><span style={{fontSize: '22px'}}>🔔</span>Notify</button></Link>
      </div>
    </div>
  )
                }
