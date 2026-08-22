'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Check, X, MessageCircle, Users, UserPlus } from 'lucide-react';

export default function FriendsPage(){
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<'friends'|'requests'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(()=>{ const unsub=onAuthStateChanged(auth,u=>{if(u) setCurrentUser(u)}); return()=>unsub(); },[]);

  useEffect(()=>{
    if(!currentUser?.uid) return;
    const unsub1 = onSnapshot(collection(db,"users",currentUser.uid,"friends"), snap=> setFriends(snap.docs.map(d=>d.data())));
    const unsub2 = onSnapshot(query(collection(db,"friendRequests"), where("toUid","==",currentUser.uid)), snap=> setRequests(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=>{ unsub1(); unsub2(); };
  },[currentUser]);

  const confirmReq = async (req:any)=>{
    await setDoc(doc(db,"users",currentUser.uid,"friends",req.fromUid),{uid:req.fromUid,name:req.fromName,photoURL:req.fromPhoto||'',addedAt:serverTimestamp()});
    const meDoc = await getDoc(doc(db,"users",currentUser.uid));
    const me = meDoc.data();
    await setDoc(doc(db,"users",req.fromUid,"friends",currentUser.uid),{uid:currentUser.uid,name:me?.name||'',photoURL:me?.photoURL||'',addedAt:serverTimestamp()});
    await deleteDoc(doc(db,"friendRequests",req.id));
  };
  const deleteReq = async (id:string)=>{ await deleteDoc(doc(db,"friendRequests",id)); };

  return(
    <div style={{ background:'#f0f2f5', minHeight:'calc(100vh - 135px)', padding:'12px' }}>
      <div style={{ display:'flex', background:'#fff', borderRadius:'14px', padding:'4px', gap:'4px' }}>
        <button onClick={()=>setTab('friends')} style={{ flex:1, background:tab==='friends'?'#8d31ce':'transparent', color:tab==='friends'?'#fff':'#666', border:'none', borderRadius:'10px', padding:'10px', fontWeight:'800', fontSize:'14px' }}>Friends ({friends.length})</button>
        <button onClick={()=>setTab('requests')} style={{ flex:1, background:tab==='requests'?'#8d31ce':'transparent', color:tab==='requests'?'#fff':'#666', border:'none', borderRadius:'10px', padding:'10px', fontWeight:'800', fontSize:'14px' }}>Friend Requests ({requests.length})</button>
      </div>

      <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
        {tab==='friends'? (
          friends.length===0? <p style={{ textAlign:'center', color:'#999', marginTop:'20px' }}>Friend la nei lo</p> :
          friends.map((f:any,i:number)=>(
            <div key={i} style={{ background:'#fff', borderRadius:'14px', padding:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
              {f.photoURL? <img src={f.photoURL} style={{ width:'48px', height:'48px', borderRadius:'12px', objectFit:'cover' }} alt="" /> : <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800' }}>{f.name?.charAt(0)}</div>}
              <div style={{ flex:1 }}><div style={{ fontWeight:'700', fontSize:'15px' }}>{f.name}</div><div style={{ fontSize:'12px', color:'#888' }}>Friends</div></div>
              <button onClick={()=>router.push(`/chat/${f.uid}`)} style={{ width:'36px', height:'36px', background:'#f3f0ff', border:'none', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}><MessageCircle size={16} color="#8d31ce"/></button>
              <button onClick={()=>router.push(`/profile/${f.uid}`)} style={{ background:'#f3f4f6', border:'none', borderRadius:'10px', padding:'8px 12px', fontWeight:'700', fontSize:'12px' }}>View</button>
            </div>
          ))
        ):(
          requests.length===0? <p style={{ textAlign:'center', color:'#999', marginTop:'20px' }}>Request awm lo</p> :
          requests.map((r:any)=>(
            <div key={r.id} style={{ background:'#fff', borderRadius:'14px', padding:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
              {r.fromPhoto? <img src={r.fromPhoto} style={{ width:'48px', height:'48px', borderRadius:'12px', objectFit:'cover' }} alt="" /> : <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#8d31ce', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800' }}>{r.fromName?.charAt(0)}</div>}
              <div style={{ flex:1 }}><div style={{ fontWeight:'700', fontSize:'15px' }}>{r.fromName}</div><div style={{ fontSize:'12px', color:'#888' }}>Wants to be friends</div></div>
              <button onClick={()=>confirmReq(r)} style={{ background:'#22c55e', color:'#fff', border:'none', borderRadius:'10px', padding:'8px 14px', fontWeight:'700', fontSize:'13px', display:'flex', alignItems:'center', gap:'4px' }}><Check size={14}/> Confirm</button>
              <button onClick={()=>deleteReq(r.id)} style={{ background:'#fef2f2', border:'none', borderRadius:'10px', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={16} color="#ef4444"/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
              }
