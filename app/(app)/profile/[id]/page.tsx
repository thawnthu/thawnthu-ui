'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Ban, Edit3, X, Mail, Camera, Loader2, Gamepad2, Heart, Home, UserPlus, Users, Cake, Save, Check, Clock } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, onSnapshot as onSnapCol, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', dob: '', village: '', games: '', hobby: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [status, setStatus] = useState<'none'|'pending'|'incoming'|'friends'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const unsub = onAuthStateChanged(auth, u=>{if(u) setCurrentUser(u)}); return ()=>unsub(); }, []);
  useEffect(() => {
    if(!profileId) return;
    const unsub = onSnapshot(doc(db,"users",profileId), snap=>{
      if(snap.exists()){ const d=snap.data(); setUserData({id:snap.id,...d}); setForm({name:d.name||'',bio:d.bio||'',dob:d.dob||'',village:d.village||'',games:d.favoriteGames||'',hobby:d.hobby||''}); }
    }); return ()=>unsub();
  }, [profileId]);
  useEffect(() => {
    if(!profileId) return;
    const unsub = onSnapCol(collection(db,"users",profileId,"friends"), snap=> setFriends(snap.docs.map(d=>d.data())));
    return ()=>unsub();
  }, [profileId]);

  // CHECK STATUS - Hei hi a pawimawh
  useEffect(() => {
    if(!currentUser?.uid ||!profileId || currentUser.uid===profileId) return;
    const check = async () => {
      const friendDoc = await getDoc(doc(db,"users",currentUser.uid,"friends",profileId));
      if(friendDoc.exists()){ setStatus('friends'); return; }
      const outgoing = await getDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`));
      if(outgoing.exists()){ setStatus('pending'); return; }
      const incoming = await getDoc(doc(db,"friendRequests",`${profileId}_${currentUser.uid}`));
      if(incoming.exists()){ setStatus('incoming'); return; }
      setStatus('none');
    };
    check();
    // realtime listen
    const unsub1 = onSnapshot(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`), s=>{ if(s.exists()) setStatus('pending'); });
    const unsub2 = onSnapshot(doc(db,"friendRequests",`${profileId}_${currentUser.uid}`), s=>{ if(s.exists() && status!=='friends') setStatus('incoming'); });
    const unsub3 = onSnapshot(doc(db,"users",currentUser.uid,"friends",profileId), s=>{ if(s.exists()) setStatus('friends'); });
    return ()=>{ unsub1(); unsub2(); unsub3(); };
  }, [currentUser, profileId, friends.length]);

  const isOwn = currentUser?.uid===profileId;
  const isOnline = (u:any)=>{ try{ const last=u.lastSeen?.toDate?u.lastSeen.toDate():new Date(u.lastSeen); return Date.now()-last.getTime()<120000;}catch{return!!u?.online} };

  const compressImage = (file:File):Promise<string>=>new Promise((resolve)=>{
    const r=new FileReader(); r.onload=(e)=>{
      const img=new Image(); img.onload=()=>{
        const c=document.createElement('canvas'); let w=img.width,h=img.height; if(w>500){h=(h*500)/w; w=500;} c.width=w; c.height=h; c.getContext('2d')?.drawImage(img,0,0,w,h); resolve(c.toDataURL('image/jpeg',0.8));
      }; img.src=e.target?.result as string;
    }; r.readAsDataURL(file);
  });

  const handleFileChange=async(e:any)=>{
    const file=e.target.files?.[0]; if(!file||!currentUser?.uid) return;
    setUploading(true); const b64=await compressImage(file);
    await updateDoc(doc(db,"users",currentUser.uid),{photoURL:b64,updatedAt:serverTimestamp()});
    setUploading(false); if(fileInputRef.current) fileInputRef.current.value='';
  };

  const handleSave=async()=>{
    setSaving(true);
    await updateDoc(doc(db,"users",currentUser.uid),{ name:form.name.trim(), bio:form.bio.trim(), dob:form.dob, village:form.village.trim(), favoriteGames:form.games.trim(), hobby:form.hobby.trim(), updatedAt:serverTimestamp() });
    setSaving(false); setEditMode(false);
  };

  // ADD FRIEND -> REQUEST
  const sendRequest=async()=>{
    if(!currentUser?.uid) return;
    await setDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`),{
      fromUid:currentUser.uid, toUid:profileId, fromName:currentUser.displayName||form.name, fromPhoto:currentUser.photoURL||'', toName:userData.name, createdAt:serverTimestamp(), status:'pending'
    });
    setStatus('pending');
  };

  // CANCEL REQUEST
  const cancelRequest=async()=>{
    await deleteDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`));
    setStatus('none');
  };

  // CONFIRM REQUEST - A add tu profile kan visit chuan Confirm a lang
  const confirmRequest=async()=>{
    const reqId = `${profileId}_${currentUser.uid}`;
    await setDoc(doc(db,"users",currentUser.uid,"friends",profileId),{uid:profileId,name:userData.name,photoURL:userData.photoURL||'',addedAt:serverTimestamp()});
    await setDoc(doc(db,"users",profileId,"friends",currentUser.uid),{uid:currentUser.uid,name:currentUser.displayName||form.name,photoURL:currentUser.photoURL||'',addedAt:serverTimestamp()});
    await deleteDoc(doc(db,"friendRequests",reqId));
    setStatus('friends');
  };

  const unfriend=async()=>{
    if(!confirm("Unfriend?")) return;
    await deleteDoc(doc(db,"users",currentUser.uid,"friends",profileId));
    await deleteDoc(doc(db,"users",profileId,"friends",currentUser.uid));
    setStatus('none');
  };

  if(!userData) return <div style={{padding:'40px',display:'flex',justifyContent:'center'}}><Loader2 className="animate-spin" size={28} color="#8d31ce"/></div>;

  return (
    <div style={{ background:'#f0f2f5', minHeight:'calc(100vh - 135px)', paddingBottom:'30px' }}>
      <div style={{ height:'130px', background:'linear-gradient(135deg,#8d31ce,#a855f7,#d8b4fe)', borderRadius:'0 0 24px 24px' }}></div>

      <div style={{ marginTop:'-70px', padding:'0 12px' }}>
        <div style={{ background:'#fff', borderRadius:'24px', padding:'24px 16px 20px', boxShadow:'0 8px 30px rgba(0,0,0,0.08)', textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ position:'relative' }} onClick={()=>isOwn&&fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}}/>
              {userData.photoURL? <img src={userData.photoURL} style={{ width:'150px', height:'150px', borderRadius:'36px', objectFit:'cover', border:'6px solid #fff', boxShadow:'0 10px 30px rgba(0,0,0,0.18)' }} alt="" /> : <div style={{ width:'150px', height:'150px', borderRadius:'36px', background:'linear-gradient(135deg,#8d31ce,#a855f7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'52px', fontWeight:'800', border:'6px solid #fff' }}>{(userData.name||'U').charAt(0).toUpperCase()}</div>}
              {isOwn&& <div style={{ position:'absolute', bottom:'4px', right:'4px', width:'36px', height:'36px', background:'#111', border:'3px solid #fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{uploading? <Loader2 size={16} color="#fff" className="animate-spin"/> : <Camera size={16} color="#fff"/>}</div>}
            </div>
          </div>

          <div style={{ marginTop:'16px' }}>
            <h1 style={{ margin:0, fontSize:'24px', fontWeight:'800' }}>{editMode? <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ width:'90%', textAlign:'center', fontSize:'20px', fontWeight:'800', border:'1.5px solid #ddd', borderRadius:'12px', padding:'10px' }} /> : userData.name}</h1>
            <p style={{ margin:'6px 0 0', fontSize:'14px', fontWeight:'700', color:isOnline(userData)?'#22c55e':'#999' }}>● {isOnline(userData)?'Online':'Offline'} • {friends.length} Friends</p>
          </div>

          <div style={{ marginTop:'14px', background:'#f8f5ff', borderRadius:'14px', padding:'12px 14px' }}>
            {editMode? <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} style={{ width:'100%', border:'1.5px solid #ddd', borderRadius:'10px', padding:'10px', fontSize:'15px' }} /> : <p style={{ margin:0, fontSize:'15px', color:'#444', lineHeight:'21px' }}>{userData.bio||"Bio awm lo."}</p>}
          </div>

          <div style={{ display:'flex', gap:'8px', marginTop:'16px', justifyContent:'center' }}>
            {isOwn? (
             !editMode? <button onClick={()=>setEditMode(true)} style={{ background:'#8d31ce', color:'#fff', border:'none', borderRadius:'14px', padding:'12px 28px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', gap:'6px' }}><Edit3 size={18}/> Edit Profile</button>
              : <><button onClick={()=>setEditMode(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'14px', padding:'12px 18px', fontWeight:'700' }}><X size={16}/> Cancel</button><button onClick={handleSave} style={{ background:'#8d31ce', color:'#fff', border:'none', borderRadius:'14px', padding:'12px 24px', fontWeight:'700', display:'flex', gap:'6px' }}><Save size={16}/> Save</button></>
            ):(
              <>
                <button onClick={()=>router.push(`/chat/${profileId}`)} style={{ flex:1, background:'#8d31ce', color:'#fff', border:'none', borderRadius:'14px', padding:'13px', fontWeight:'700', fontSize:'15px' }}>Chat</button>

                {status==='none' && <button onClick={sendRequest} style={{ flex:1, background:'#e9e5ff', color:'#8d31ce', border:'none', borderRadius:'14px', padding:'13px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}><UserPlus size={18}/> Add Friend</button>}
                {status==='pending' && <button onClick={cancelRequest} style={{ flex:1, background:'#fff7ed', color:'#f97316', border:'1.5px solid #fed7aa', borderRadius:'14px', padding:'13px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}><Clock size={18}/> Request Sent</button>}
                {status==='incoming' && <button onClick={confirmRequest} style={{ flex:1, background:'#22c55e', color:'#fff', border:'none', borderRadius:'14px', padding:'13px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}><Check size={18}/> Confirm</button>}
                {status==='friends' && <button onClick={unfriend} style={{ flex:1, background:'#f3f4f6', color:'#111', border:'none', borderRadius:'14px', padding:'13px', fontWeight:'700', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}><Users size={18}/> Friends</button>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ABOUT - a hma ang tho */}
      <div style={{ padding:'12px 12px 0' }}>
        <div style={{ background:'#fff', borderRadius:'18px', padding:'16px' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:'16px', fontWeight:'800' }}>About</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ display:'flex', gap:'12px' }}><div style={{ width:'40px', height:'40px', background:'#f3f0ff', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><Mail size={18} color="#8d31ce"/></div><div><div style={{ fontSize:'13px', color:'#888', fontWeight:'600' }}>Email</div><div style={{ fontSize:'16px', fontWeight:'700' }}>{userData.email}</div></div></div>
            <div style={{ display:'flex', gap:'12px' }}><div style={{ width:'40px', height:'40px', background:'#fef3f2', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><Cake size={18} color="#ef4444"/></div><div style={{ flex:1 }}>{editMode? <><div style={{ fontSize:'13px', color:'#888' }}>Date of Birth</div><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} style={{ width:'100%', border:'1.5px solid #ddd', borderRadius:'8px', padding:'8px', fontSize:'15px' }} /></> : <><div style={{ fontSize:'13px', color:'#888' }}>Date of Birth</div><div style={{ fontSize:'16px', fontWeight:'700' }}>{userData.dob||'Not set'}</div></>}</div></div>
            <div style={{ display:'flex', gap:'12px' }}><div style={{ width:'40px', height:'40px', background:'#f0fdf4', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><Home size={18} color="#22c55e"/></div><div style={{ flex:1 }}>{editMode? <><div style={{ fontSize:'13px', color:'#888' }}>Village</div><input value={form.village} onChange={e=>setForm({...form,village:e.target.value})} style={{ width:'100%', border:'1.5px solid #ddd', borderRadius:'8px', padding:'8px', fontSize:'15px' }} /></> : <><div style={{ fontSize:'13px', color:'#888' }}>Village</div><div style={{ fontSize:'16px', fontWeight:'700' }}>{userData.village||'Mizoram'}</div></>}</div></div>
            <div style={{ display:'flex', gap:'12px' }}><div style={{ width:'40px', height:'40px', background:'#eff6ff', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><Gamepad2 size={18} color="#3b82f6"/></div><div style={{ flex:1 }}>{editMode? <><div style={{ fontSize:'13px', color:'#888' }}>Favorite Games</div><input value={form.games} onChange={e=>setForm({...form,games:e.target.value})} style={{ width:'100%', border:'1.5px solid #ddd', borderRadius:'8px', padding:'8px', fontSize:'15px' }} /></> : <><div style={{ fontSize:'13px', color:'#888' }}>Favorite Games</div><div style={{ fontSize:'16px', fontWeight:'700' }}>{userData.favoriteGames||'Not set'}</div></>}</div></div>
            <div style={{ display:'flex', gap:'12px' }}><div style={{ width:'40px', height:'40px', background:'#fdf2f8', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><Heart size={18} color="#ec4899"/></div><div style={{ flex:1 }}>{editMode? <><div style={{ fontSize:'13px', color:'#888' }}>Hobby</div><input value={form.hobby} onChange={e=>setForm({...form,hobby:e.target.value})} style={{ width:'100%', border:'1.5px solid #ddd', borderRadius:'8px', padding:'8px', fontSize:'15px' }} /></> : <><div style={{ fontSize:'13px', color:'#888' }}>Hobby</div><div style={{ fontSize:'16px', fontWeight:'700' }}>{userData.hobby||'Not set'}</div></>}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
                                                                                                                                                                                                                                                                                                                                                                                                                      }
