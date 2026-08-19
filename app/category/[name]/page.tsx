'use client';
import { useState, useEffect, useRef } from 'react'; // 1. useRef belh
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Comment = { name: string; text: string; time: number; }
type Post = { id: string; title: string; content: string; category: string; author: string; createdAt: any; }
type FontSize = 'small' | 'medium' | 'large';

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likes, setLikes] = useState<{[key: string]: boolean}>({});
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [commentName, setCommentName] = useState<{[key: string]: string}>({});
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showCommentBox, setShowCommentBox] = useState<{[key: string]: boolean}>({});
  const [toast, setToast] = useState('');

  const menuRef = useRef<HTMLDivElement>(null); // 2. MENU REF

  // 3. HMUN DANG CLICK CHUAN MENU CLOSE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current &&!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode');
    const savedFont = localStorage.getItem('fontSize');
    const savedLikes = localStorage.getItem('likes');
    const savedComments = localStorage.getItem('comments');
    if(savedDark!== null) setDark(JSON.parse(savedDark));
    if(savedFont) setFontSize(JSON.parse(savedFont));
    if(savedLikes) setLikes(JSON.parse(savedLikes));
    if(savedComments) setComments(JSON.parse(savedComments));
  }, []);

  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem('fontSize', JSON.stringify(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('comments', JSON.stringify(comments)); }, [comments]);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(()=>setToast(''), 1500);
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('copied');
  }

  const handleShare = async (p: Post) => {
    const shareUrl = `${window.location.origin}/post/${p.id}`;
    const shareData = { title: p.title, text: p.content.substring(0,100) + '...', url: shareUrl };
    try {
      if (navigator.share) { await navigator.share(shareData); }
      else { navigator.clipboard.writeText(shareUrl); showToast('Link copied'); }
    } catch (err) { console.log('Share failed', err); }
  }

  const handleLike = (id: string, e: any) => {
    e.stopPropagation();
    setLikes(prev => ({...prev, [id]:!prev[id]}));
  }

  const handleCommentClick = (id: string, e: any) => {
    e.stopPropagation();
    setShowCommentBox(prev => ({...prev, [id]:!prev[id]}));
  }

  const submitComment = (id: string) => {
    if(!commentName[id] ||!commentText[id]) return;
    const newComment: Comment = { name: commentName[id], text: commentText[id], time: Date.now() }
    setComments(prev => ({...prev, [id]: [...(prev[id] || []), newComment]}));
    setCommentName(prev => ({...prev, [id]: ''}));
    setCommentText(prev => ({...prev, [id]: ''}));
  }

  const bg = dark? '#0f0f10' : '#f5f5f5';
  const card = dark? '#1a1a1c' : '#ffffff';
  const text = dark? '#ffffff' : '#000';
  const subtext = dark? '#a0a0a0' : '#555';
  const border = dark? '#2a2a2c' : '#e0e0e0';
  const accent = '#5865F2';

  const fontSizes = {
    small: { base: '13px', h1: '20px', h2: '16px', h3: '15px' },
    medium: { base: '14px', h1: '24px', h2: '20px', h3: '18px' },
    large: { base: '16px', h1: '28px', h2: '22px', h3: '20px' }
  }
  const fs = fontSizes[fontSize];

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    if (typeof timestamp === 'string') return "just now";
    let date = timestamp.toDate? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "just now";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div style={{background: bg, color: text, minHeight: '100vh', fontSize: fs.base}}>
      {toast && <div style={{position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', zIndex: 200}}>{toast}</div>}

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, background: bg, zIndex: 20}}>
        <h1 style={{fontSize: fs.h1, fontWeight: '800', margin: 0}}>Thawnthu V2</h1>

        {/* 4. MENU REF BELH */}
        <div style={{position: 'relative'}} ref={menuRef}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background: 'none', border: 'none', color: text, fontSize: '28px', cursor: 'pointer'}}>⋮</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '40px', background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '8px 0', minWidth: '180px', zIndex: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}>

              {/* 5. MENU INKAR AH LINE DAH */}
              <button onClick={()=>{setShowSettings(true); setMenuOpen(false)}} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: text, textAlign: 'left', fontSize: '15px', cursor: 'pointer'}}>⚙️ Setting</button>

              <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '4px 12px'}}/>

              <Link href="/about" onClick={()=>setMenuOpen(false)} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>ℹ️ About</Link>

              <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '4px 12px'}}/>

              <Link href="/contact" onClick={()=>setMenuOpen(false)} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: text, textDecoration: 'none', fontSize: '15px'}}>📞 Contact Us</Link>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div onClick={()=>setShowSettings(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background: card, borderRadius: '16px', padding: '20px', width: '90%', maxWidth: '400px'}}>
            <h2 style={{margin: '0 0 16px 0', fontSize: fs.h2}}>⚙️ Setting</h2>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <span style={{fontSize: fs.base}}>Dark Mode</span>
              <button onClick={()=>setDark(!dark)} style={{background: dark? accent : border, width: '50px', height: '28px', borderRadius: '14px', border: 'none', position: 'relative', cursor: 'pointer'}}>
                <div style={{background: 'white', width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', top: '3px', left: dark? '25px' : '3px', transition: '0.3s'}}></div>
              </button>
            </div>
            <div style={{marginBottom: '20px'}}>
              <span style={{fontSize: fs.base, display: 'block', marginBottom: '10px'}}>Font Size</span>
              <div style={{display: 'flex', gap: '8px'}}>
                {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                  <button key={size} onClick={()=>setFontSize(size)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${fontSize === size? accent : border}`, background: fontSize === size? accent : 'transparent', color: fontSize === size? 'white' : text, fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize'}}>{size}</button>
                ))}
              </div>
            </div>
            <button onClick={()=>setShowSettings(false)} style={{width: '100%', background: accent, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700'}}>Done</button>
          </div>
        </div>
      )}

      <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Link href="/category" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: subtext}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span style={{fontSize: fs.h2, fontWeight: '800'}}>{categoryName}</span>
        </Link>
      </div>

      <div style={{padding: '0 12px 80px 12px'}}>
        {loading? <p style={{padding: '0 4px'}}>Loading...</p> :
        posts.length === 0? <p style={{padding: '0 4px'}}>He category ah hian post ala awm lo</p> :
        posts.map((p)=>(
          <div key={p.id} style={{background: card, margin: '12px 0', padding: '16px', borderRadius: '16px', border: `1px solid ${border}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <h3 style={{margin: 0, fontSize: fs.h3, fontWeight: '700'}}>{p.title}</h3>
              <button onClick={()=>copyText(p.content)} style={{background: border, color: text, border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'}}>📋 Copy</button>
            </div>
            <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '8px 0'}}/>
            <p style={{margin: '0 0 12px 0', fontSize: fs.base}}>
              {p.content.substring(0,200)}...
              <button onClick={()=>setSelectedPost(p)} style={{background: 'none', border: 'none', color: accent, fontSize: fs.base, fontWeight: '700', cursor: 'pointer', padding: '0 0 0 4px'}}>Read more</button>
            </p>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: subtext}}>
              <span>{p.author} • {timeAgo(p.createdAt)}</span>
              <div style={{display: 'flex', gap: '16px'}}>
                <button onClick={(e)=>handleLike(p.id, e)} style={{background: 'none', border: 'none', color: likes[p.id]? accent : subtext, cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'}}>({likes[p.id]? 1 : 0})❤️</button>
                <button onClick={(e)=>handleCommentClick(p.id, e)} style={{background: 'none', border: 'none', color: subtext, cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'}}>({comments[p.id]?.length || 0})💬</button>
                <button onClick={()=>handleShare(p)} style={{background: 'none', border: 'none', color: subtext, cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'}}>📤</button>
              </div>
            </div>
            {showCommentBox[p.id] && (
              <div style={{marginTop: '12px'}}>
                {comments[p.id]?.map((c, i)=>(
                  <div key={i} style={{background: bg, padding: '8px', borderRadius: '8px', marginBottom: '6px', fontSize: '13px'}}>
                    <b>{c.name}</b> <span style={{fontSize: '10px', color: subtext}}>{timeAgo(c.time)}</span>
                    <p style={{margin: '4px 0 0 0'}}>{c.text}</p>
                  </div>
                ))}
                <div style={{display: 'flex', gap: '6px', marginTop: '8px'}}>
                  <input type="text" placeholder="Hming" value={commentName[p.id] || ''} onChange={(e)=>setCommentName(prev=>({...prev, [p.id]: e.target.value}))} style={{width: '80px', padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '12px', flexShrink: 0}}/>
                  <input type="text" placeholder="Comment ziak rawh..." value={commentText[p.id] || ''} onChange={(e)=>setCommentText(prev=>({...prev, [p.id]: e.target.value}))} style={{flex: 1, minWidth: 0, padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '12px'}}/>
                  <button onClick={()=>submitComment(p.id)} style={{background: accent, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', flexShrink: 0, whiteSpace: 'nowrap'}}>Send</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPost && (
        <div onClick={()=>setSelectedPost(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, padding: '20px', overflowY: 'auto'}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background: card, borderRadius: '16px', padding: '20px', maxWidth: '700px', margin: '40px auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <h2 style={{margin: 0, fontSize: fs.h2}}>{selectedPost.title}</h2>
              <button onClick={()=>copyText(selectedPost.content)} style={{background: border, color: text, border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'}}>📋 Copy</button>
            </div>
            <hr style={{border: 'none', borderBottom: `1px solid ${border}`, margin: '8px 0'}}/>
            <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: fs.base}}>{selectedPost.content}</p>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px'}}>
              <div style={{display: 'flex', gap: '12px'}}>
                <button onClick={(e)=>handleLike(selectedPost.id, e)} style={{background: border, color: likes[selectedPost.id]? accent : text, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}>({likes[selectedPost.id]? 1 : 0})❤️</button>
                <button onClick={(e)=>handleCommentClick(selectedPost.id, e)} style={{background: border, color: text, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}>({comments[selectedPost.id]?.length || 0})💬</button>
                <button onClick={()=>handleShare(selectedPost)} style={{background: border, color: text, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700'}}>📤 Share</button>
              </div>
              <button onClick={()=>setSelectedPost(null)} style={{background: border, color: text, border: 'none', padding: '10px 16px', borderRadius: '8px'}}>Close</button>
            </div>
            {showCommentBox[selectedPost.id] && (
              <div style={{marginTop: '12px'}}>
                {comments[selectedPost.id]?.map((c, i)=>(
                  <div key={i} style={{background: bg, padding: '8px', borderRadius: '8px', marginBottom: '6px', fontSize: '13px'}}>
                    <b>{c.name}</b> <span style={{fontSize: '10px', color: subtext}}>{timeAgo(c.time)}</span>
                    <p style={{margin: '4px 0 0 0'}}>{c.text}</p>
                  </div>
                ))}
                <div style={{display: 'flex', gap: '6px', marginTop: '8px', width: '100%'}}>
                  <input type="text" placeholder="Hming" value={commentName[selectedPost.id] || ''} onChange={(e)=>setCommentName(prev=>({...prev, [selectedPost.id]: e.target.value}))} style={{width: '80px', padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '12px', flexShrink: 0}}/>
                  <input type="text" placeholder="Comment ziak rawh..." value={commentText[selectedPost.id] || ''} onChange={(e)=>setCommentText(prev=>({...prev, [selectedPost.id]: e.target.value}))} style={{flex: 1, minWidth: 0, padding: '8px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: text, fontSize: '12px'}}/>
                  <button onClick={()=>submitComment(selectedPost.id)} style={{background: accent, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', flexShrink: 0, whiteSpace: 'nowrap'}}>Send</button>
                </div>
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
