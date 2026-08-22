'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Camera, Loader2, Gamepad2, Heart, Home, UserPlus, Users, Cake, Save, Check, X, Clock, Mail, Phone, Eye, EyeOff, FileText } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, onSnapshot as onSnapCol, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function FinalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', bio: '', dob: '', village: '', games: '', hobby: '', phone: '', phonePublic: false });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState<'none'|'pending'|'incoming'|'friends'>('none');
  const [ownTab, setOwnTab] = useState<'friends'|'requests'|'edit'>('friends');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ const u=onAuthStateChanged(auth, x=>{if(x) setCurrentUser(x)}); return()=>u(); },[]);
  useEffect(()=>{
    if(!profileId) return;
    const unsub = onSnapshot(doc(db,"users",profileId), s=>{
      if(s.exists()){
        const d=s.data();
        setUserData({id:s.id,...d});
        setForm({
          name:d.name||'', bio:d.bio||'', dob:d.dob||'', village:d.village||'',
          games:d.favoriteGames||'', hobby:d.hobby||'',
          phone:d.phone||'', phonePublic:d.phonePublic||false
        });
      }
    });
    return()=>unsub();
  },[profileId]);
  useEffect(()=>{
    if(!profileId) return;
    const unsub = onSnapCol(collection(db,"users",profileId,"friends"), s=> setFriends(s.docs.map(d=>d.data())));
    return()=>unsub();
  },[profileId]);
  useEffect(()=>{
    if(!currentUser?.uid) return;
    const q = query(collection(db,"friendRequests"), where("toUid","==",currentUser.uid));
    const unsub = onSnapCol(q, s=> setRequests(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>unsub();
  },[currentUser]);
  useEffect(()=>{
    if(!currentUser?.uid ||!profileId || currentUser.uid===profileId) return;
    const check = async()=>{
      const f = await getDoc(doc(db,"users",currentUser.uid,"friends",profileId));
      if(f.exists()){setStatus('friends'); return;}
      const out = await getDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`));
      if(out.exists()){setStatus('pending'); return;}
      const inc = await getDoc(doc(db,"friendRequests",`${profileId}_${currentUser.uid}`));
      if(inc.exists()){setStatus('incoming'); return;}
      setStatus('none');
    }; check();
  },[currentUser, profileId]);

  const isOwn = currentUser?.uid===profileId;
  const compress = (file:File):Promise<string>=> new Promise(res=>{
    const r=new FileReader(); r.onload=e=>{
      const img=new Image(); img.onload=()=>{
        const c=document.createElement('canvas'); let w=img.width,h=img.height; if(w>500){h=(h*500)/w; w=500;} c.width=w; c.height=h; c.getContext('2d')?.drawImage(img,0,0,w,h); res(c.toDataURL('image/jpeg',0.8));
      }; img.src=e.target?.result as string;
    }; r.readAsDataURL(file);
  });
  const onFile = async(e:any)=>{
    const file=e.target.files?.[0]; if(!file) return; setUploading(true);
    const b64=await compress(file); await updateDoc(doc(db,"users",currentUser.uid),{photoURL:b64}); setUploading(false);
  };
  const save = async()=>{
    setSaving(true);
    await updateDoc(doc(db,"users",currentUser.uid),{
      name:form.name.trim(), bio:form.bio.trim(), dob:form.dob, village:form.village.trim(),
      favoriteGames:form.games.trim(), hobby:form.hobby.trim(),
      phone:form.phone.trim(), phonePublic:form.phonePublic,
      updatedAt:serverTimestamp()
    });
    setSaving(false); setOwnTab('friends');
  };
  const sendReq = async()=>{ await setDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`),{fromUid:currentUser.uid,toUid:profileId,fromName:form.name,fromPhoto:userData.photoURL||'',toName:userData.name,createdAt:serverTimestamp()}); setStatus('pending'); };
  const cancelReq = async()=>{ await deleteDoc(doc(db,"friendRequests",`${currentUser.uid}_${profileId}`)); setStatus('none'); };
  const confirmReq = async(fromId:string, reqId:string, fromName:string, fromPhoto:string)=>{
    await setDoc(doc(db,"users",currentUser.uid,"friends",fromId),{uid:fromId,name:fromName,photoURL:fromPhoto,addedAt:serverTimestamp()});
    await setDoc(doc(db,"users",fromId,"friends",currentUser.uid),{uid:currentUser.uid,name:form.name,photoURL:userData.photoURL||'',addedAt:serverTimestamp()});
    await deleteDoc(doc(db,"friendRequests",reqId));
  };
  const confirmIncoming = async()=>{
    await setDoc(doc(db,"users",currentUser.uid,"friends",profileId),{uid:profileId,name:userData.name,photoURL:userData.photoURL||'',addedAt:serverTimestamp()});
    await setDoc(doc(db,"users",profileId,"friends",currentUser.uid),{uid:currentUser.uid,name:form.name,photoURL:userData.photoURL||'',addedAt:serverTimestamp()});
    await deleteDoc(doc(db,"friendRequests",`${profileId}_${currentUser.uid}`)); setStatus('friends');
  };

  if(!userData) return <div style={{padding:40,display:'flex',justifyContent:'center'}}><Loader2 className="animate-spin" color="#8d31ce"/></div>;

  // Phone show logic
  const canSeePhone = isOwn || userData.phonePublic;

  return (
    <div style={{background:'#f0f2f5',minHeight:'calc(100vh - 135px)',paddingBottom:30}}>
      <div style={{height:120,background:'linear-gradient(135deg,#8d31ce,#a855f7)',borderRadius:'0 0 22px 22px'}}></div>

      <div style={{marginTop:-60,padding:'0 12px'}}>
        <div style={{background:'#fff',borderRadius:22,padding:'18px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.08)',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center'}}>
            <div style={{position:'relative'}} onClick={()=>isOwn&&fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/>
              {userData.photoURL? <img src={userData.photoURL} style={{width:140,height:140,borderRadius:32,objectFit:'cover',border:'5px solid #fff',boxShadow:'0 8px 20px rgba(0,0,0,0.15)'}} alt=""/> : <div style={{width:140,height:140,borderRadius:32,background:'#8d31ce',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,fontWeight:800,border:'5px solid #fff'}}>{(userData.name||'U').charAt(0)}</div>}
              {isOwn&& <div style={{position:'absolute',bottom:2,right:2,width:32,height:32,background:'#111',border:'3px solid #fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{uploading? <Loader2 size={14} color="#fff" className="animate-spin"/> : <Camera size={14} color="#fff"/>}</div>}
            </div>
          </div>
          <h2 style={{margin:'12px 0 0',fontSize:20,fontWeight:800}}>{userData.name}</h2>
          <p style={{margin:'4px 0 0',fontSize:13,fontWeight:700,color:'#22c55e'}}>● Online • {friends.length} Friends</p>

          {/* 3. BIO BO - A chung ami ka la bo */}

          {isOwn? (
            <div style={{display:'flex',gap:6,marginTop:12,background:'#f3f4f6',borderRadius:12,padding:4}}>
              <button onClick={()=>setOwnTab('friends')} style={{flex:1,background:ownTab==='friends'?'#8d31ce':'transparent',color:ownTab==='friends'?'#fff':'#666',border:'none',borderRadius:9,padding:'8px 4px',fontWeight:800,fontSize:12}}>Friends ({friends.length})</button>
              <button onClick={()=>setOwnTab('requests')} style={{flex:1,background:ownTab==='requests'?'#8d31ce':'transparent',color:ownTab==='requests'?'#fff':'#666',border:'none',borderRadius:9,padding:'8px 4px',fontWeight:800,fontSize:12}}>Requests ({requests.length})</button>
              <button onClick={()=>setOwnTab('edit')} style={{flex:1,background:ownTab==='edit'?'#111':'transparent',color:ownTab==='edit'?'#fff':'#666',border:'none',borderRadius:9,padding:'8px 4px',fontWeight:800,fontSize:12}}>Edit Profile</button>
            </div>
          ):(
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button onClick={()=>router.push(`/chat/${profileId}`)} style={{flex:1,background:'#8d31ce',color:'#fff',border:'none',borderRadius:12,padding:11,fontWeight:700,fontSize:14}}>Chat</button>
              {status==='none'&& <button onClick={sendReq} style={{flex:1,background:'#e9e5ff',color:'#8d31ce',border:'none',borderRadius:12,padding:11,fontWeight:700,fontSize:14}}><UserPlus size={16}/> Add</button>}
              {status==='pending'&& <button onClick={cancelReq} style={{flex:1,background:'#fff7ed',color:'#f97316',border:'1px solid #fed7aa',borderRadius:12,padding:11,fontWeight:700,fontSize:12}}><Clock size={14}/> Requested</button>}
              {status==='incoming'&& <button onClick={confirmIncoming} style={{flex:1,background:'#22c55e',color:'#fff',border:'none',borderRadius:12,padding:11,fontWeight:700,fontSize:14}}><Check size={16}/> Confirm</button>}
              {status==='friends'&& <button style={{flex:1,background:'#f3f4f6',border:'none',borderRadius:12,padding:11,fontWeight:700,fontSize:14}}><Users size={16}/> Friends</button>}
            </div>
          )}
        </div>
      </div>

      <div style={{padding:'10px 12px 0',display:'flex',flexDirection:'column',gap:10}}>

        {/* 2. FRIEND LIST - User list ang */}
        {isOwn && ownTab==='friends' && (
          <div style={{background:'#fff',borderRadius:16,padding:14}}>
            <h3 style={{margin:'0 0 10px',fontSize:15,fontWeight:800}}>Friends ({friends.length})</h3>
            {friends.length===0? <p style={{fontSize:13,color:'#999',textAlign:'center',padding:10}}>Friend la nei lo</p> :
              friends.map((f:any,i:number)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                  <div onClick={()=>router.push(`/profile/${f.uid}`)} style={{display:'flex',alignItems:'center',gap:12,flex:1,cursor:'pointer'}}>
                    {f.photoURL? <img src={f.photoURL} style={{width:44,height:44,borderRadius:12,objectFit:'cover'}} alt=""/> : <div style={{width:44,height:44,borderRadius:12,background:'#eee',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{f.name?.charAt(0)}</div>}
                    <div><div style={{fontSize:14,fontWeight:700}}>{f.name}</div><div style={{fontSize:11,color:'#22c55e'}}>● Online</div></div>
                  </div>
                  <button onClick={()=>router.push(`/chat/${f.uid}`)} style={{width:36,height:36,background:'#f3f0ff',border:'none',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}><MessageCircle size={16} color="#8d31ce"/></button>
                </div>
              ))
            }
          </div>
        )}

        {isOwn && ownTab==='requests' && (
          <div style={{background:'#fff',borderRadius:16,padding:14}}>
            <h3 style={{margin:'0 0 10px',fontSize:15,fontWeight:800}}>Friend Requests ({requests.length})</h3>
            {requests.length===0? <p style={{fontSize:13,color:'#999',textAlign:'center',padding:10}}>Request awm lo</p> :
              requests.map((r:any)=>(
                <div key={r.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,flex:1}}>
                    {r.fromPhoto? <img src={r.fromPhoto} style={{width:44,height:44,borderRadius:12,objectFit:'cover'}} alt=""/> : <div style={{width:44,height:44,borderRadius:12,background:'#8d31ce',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{r.fromName?.charAt(0)}</div>}
                    <div><div style={{fontSize:14,fontWeight:700}}>{r.fromName}</div><div style={{fontSize:11,color:'#888'}}>Wants to be friends</div></div>
                  </div>
                  <button onClick={()=>confirmReq(r.fromUid,r.id,r.fromName,r.fromPhoto)} style={{background:'#8d31ce',color:'#fff',border:'none',borderRadius:10,padding:'7px 12px',fontWeight:700,fontSize:12}}>Confirm</button>
                  <button onClick={async()=>await deleteDoc(doc(db,"friendRequests",r.id))} style={{background:'#f3f4f6',border:'none',borderRadius:10,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}><X size={14}/></button>
                </div>
              ))
            }
          </div>
        )}

        {/* 1. EDIT / ABOUT - a zawng a lang tawh */}
        {((isOwn && ownTab==='edit') ||!isOwn) && (
          <div style={{background:'#fff',borderRadius:16,padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:800}}>About</h3>
              {isOwn && ownTab==='edit' && <span style={{fontSize:11,color:'#8d31ce',fontWeight:700}}>Edit mode</span>}
            </div>

            {isOwn && ownTab==='edit'? (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div><label style={{fontSize:11,color:'#888',fontWeight:600}}>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:11,color:'#888',fontWeight:600}}>Village</label><input value={form.village} onChange={e=>setForm({...form,village:e.target.value})} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/></div>
                </div>

                <div><label style={{fontSize:11,color:'#888',fontWeight:600,display:'flex',alignItems:'center',gap:4}}><FileText size={12}/> Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={2} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box',resize:'none'}}/></div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div><label style={{fontSize:11,color:'#888'}}>Date of Birth</label><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:11,color:'#888'}}>Favorite Games</label><input value={form.games} onChange={e=>setForm({...form,games:e.target.value})} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:11,color:'#888'}}>Hobby</label><input value={form.hobby} onChange={e=>setForm({...form,hobby:e.target.value})} style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/></div>
                  <div>
                    <label style={{fontSize:11,color:'#888',display:'flex',justifyContent:'space-between'}}>Phone <span onClick={()=>setForm({...form,phonePublic:!form.phonePublic})} style={{color:form.phonePublic?'#22c55e':'#999',cursor:'pointer',display:'flex',alignItems:'center',gap:2}}>{form.phonePublic? <><Eye size={10}/> Public</> : <><EyeOff size={10}/> Private</>}</span></label>
                    <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="9862..." style={{width:'100%',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'7px 8px',fontSize:13,boxSizing:'border-box'}}/>
                  </div>
                </div>

                <div style={{display:'flex',gap:8,marginTop:6}}>
                  <button onClick={()=>setOwnTab('friends')} style={{flex:1,background:'#f3f4f6',border:'none',borderRadius:10,padding:10,fontWeight:700,fontSize:13}}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{flex:1,background:'#8d31ce',color:'#fff',border:'none',borderRadius:10,padding:10,fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{saving? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save</button>
                </div>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{width:32,height:32,background:'#f5f3ff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><FileText size={14} color="#8d31ce"/></div><div><div style={{fontSize:11,color:'#999',fontWeight:600}}>Bio</div><div style={{fontSize:14,fontWeight:600,marginTop:2}}>{userData.bio||"Ka account thar"}</div></div></div>
                <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#fef3f2',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Cake size={14} color="#ef4444"/></div><div><div style={{fontSize:11,color:'#999'}}>Date of Birth</div><div style={{fontSize:14,fontWeight:600}}>{userData.dob||'Not set'}</div></div></div>
                <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#f0fdf4',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Home size={14} color="#22c55e"/></div><div><div style={{fontSize:11,color:'#999'}}>Village</div><div style={{fontSize:14,fontWeight:600}}>{userData.village||'Mizoram'}</div></div></div>
                <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#eff6ff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Gamepad2 size={14} color="#3b82f6"/></div><div><div style={{fontSize:11,color:'#999'}}>Favorite Games</div><div style={{fontSize:14,fontWeight:600}}>{userData.favoriteGames||'Not set'}</div></div></div>
                <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#fdf2f8',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Heart size={14} color="#ec4899"/></div><div><div style={{fontSize:11,color:'#999'}}>Hobby</div><div style={{fontSize:14,fontWeight:600}}>{userData.hobby||'Not set'}</div></div></div>
                {canSeePhone && userData.phone && (
                  <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#f0fdf4',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Phone size={14} color="#22c55e"/></div><div><div style={{fontSize:11,color:'#999'}}>Phone {userData.phonePublic? '(Public)' : '(Private)'} </div><div style={{fontSize:14,fontWeight:600}}>{userData.phone}</div></div></div>
                )}
                <div style={{display:'flex',gap:10}}><div style={{width:32,height:32,background:'#f3f0ff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Mail size={14} color="#8d31ce"/></div><div><div style={{fontSize:11,color:'#999'}}>Email</div><div style={{fontSize:14,fontWeight:600}}>{userData.email}</div></div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
      }
