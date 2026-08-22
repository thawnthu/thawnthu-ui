'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Camera, Loader2, Gamepad2, Heart, Home, UserPlus, Users, Cake, Save, Check, X, Mail, Phone, FileText, Edit3 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, onSnapshot as onSnapCol, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', bio: '', dob: '', village: '', games: '', hobby: '', phone: '', phonePublic: false });
  const [editAbout, setEditAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState('none');
  const [showFriends, setShowFriends] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = onAuthStateChanged(auth, (x) => { if (x) setCurrentUser(x); });
    return () => u();
  }, []);

  useEffect(() => {
    if (!profileId) return;
    return onSnapshot(doc(db, 'users', profileId), (s) => {
      if (s.exists()) {
        const d = s.data();
        setUserData({ id: s.id,...d });
        setForm({ name: d.name || '', bio: d.bio || '', dob: d.dob || '', village: d.village || '', games: d.favoriteGames || '', hobby: d.hobby || '', phone: d.phone || '', phonePublic: d.phonePublic || false });
      }
    });
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    return onSnapCol(collection(db, 'users', profileId, 'friends'), (snap) => {
      setFriends(snap.docs.map((d) => d.data()));
    });
  }, [profileId]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'friendRequests'), where('toUid', '==', currentUser.uid));
    return onSnapCol(q, (snap) => setRequests(snap.docs.map((d) => ({ id: d.id,...d.data() }))));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid ||!profileId || currentUser.uid === profileId) return;
    (async () => {
      const f = await getDoc(doc(db, 'users', currentUser.uid, 'friends', profileId));
      if (f.exists()) { setStatus('friends'); return; }
      const out = await getDoc(doc(db, 'friendRequests', currentUser.uid + '_' + profileId));
      if (out.exists()) { setStatus('pending'); return; }
      const inc = await getDoc(doc(db, 'friendRequests', profileId + '_' + currentUser.uid));
      if (inc.exists()) { setStatus('incoming'); return; }
      setStatus('none');
    })();
  }, [currentUser, profileId]);

  const isOwn = currentUser?.uid === profileId;

  const onFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const c = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > 500) { h = (h * 500) / w; w = 500; }
        c.width = w; c.height = h;
        c.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const b64 = c.toDataURL('image/jpeg', 0.8);
        await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: b64 });
        setUploading(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'users', currentUser.uid), {
      name: form.name, bio: form.bio, dob: form.dob, village: form.village,
      favoriteGames: form.games, hobby: form.hobby, phone: form.phone,
      phonePublic: form.phonePublic, updatedAt: serverTimestamp()
    });
    setSaving(false); setEditAbout(false);
  };

  const sendReq = async () => {
    await setDoc(doc(db, 'friendRequests', currentUser.uid + '_' + profileId), { fromUid: currentUser.uid, toUid: profileId, fromName: form.name, fromPhoto: userData.photoURL || '', toName: userData.name, createdAt: serverTimestamp() });
    setStatus('pending');
  };

  const cancelReq = async () => { await deleteDoc(doc(db, 'friendRequests', currentUser.uid + '_' + profileId)); setStatus('none'); };

  const confirmIncoming = async () => {
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', profileId), { uid: profileId, name: userData.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', profileId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: currentUser.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', profileId + '_' + currentUser.uid)); setStatus('friends');
  };

  const confirmReq = async (fromId: string, reqId: string, fromName: string, fromPhoto: string) => {
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', fromId), { uid: fromId, name: fromName, photoURL: fromPhoto, addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', fromId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', reqId));
  };

  if (!userData) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 20 }}>
      <div style={{ height: 110, background: 'linear-gradient(135deg,#8d31ce,#a855f7)', borderRadius: '0 0 22px 22px' }} />
      <div style={{ marginTop: -55, padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: 22, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }} onClick={() => isOwn && fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
              {userData.photoURL? <img src={userData.photoURL} style={{ width: 130, height: 130, borderRadius: 30, objectFit: 'cover', border: '4px solid #fff' }} alt="" /> : <div style={{ width: 130, height: 130, borderRadius: 30, background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, border: '4px solid #fff' }}>{(userData.name || 'U').charAt(0)}</div>}
              {isOwn && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, background: '#111', border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{uploading? <Loader2 size={12} color="#fff" className="animate-spin" /> : <Camera size={12} color="#fff" />}</div>}
            </div>
          </div>
          <h2 style={{ margin: '10px 0 0', fontSize: 19, fontWeight: 800 }}>{userData.name}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>● Online • {friends.length} Friends</p>
          {isOwn? (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
              <button onClick={() => { setShowFriends(!showFriends); setShowRequests(false); }} style={{ flex: 1, background: showFriends? '#8d31ce' : 'transparent', color: showFriends? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>Friends ({friends.length})</button>
              <button onClick={() => { setShowRequests(!showRequests); setShowFriends(false); }} style={{ flex: 1, background: showRequests? '#8d31ce' : 'transparent', color: showRequests? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>Requests ({requests.length})</button>
              <button onClick={() => setEditAbout(!editAbout)} style={{ flex: 1, background: editAbout? '#111' : 'transparent', color: editAbout? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>{editAbout? 'Cancel' : 'Edit'}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => router.push('/chat/' + profileId)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700 }}>Chat</button>
              {status === 'none' && <button onClick={sendReq} style={{ flex: 1, background: '#e9e5ff', color: '#8d31ce', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700 }}>Add Friend</button>}
              {status === 'pending' && <button onClick={cancelReq} style={{ flex: 1, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', borderRadius: 12, padding: 11, fontWeight: 700 }}>Requested</button>}
              {status === 'incoming' && <button onClick={confirmIncoming} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700 }}>Confirm</button>}
              {status === 'friends' && <button style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700 }}>Friends</button>}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>About</h3>
            {isOwn &&!editAbout && <button onClick={() => setEditAbout(true)} style={{ background: '#f3f0ff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#8d31ce' }}><Edit3 size={12} /> Edit</button>}
          </div>
          {isOwn && editAbout? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value })} rows={2} placeholder="Bio" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input type="date" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value })} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} />
                <input value={form.village} onChange={(e) => setForm({...form, village: e.target.value })} placeholder="Village" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} />
                <input value={form.games} onChange={(e) => setForm({...form, games: e.target.value })} placeholder="Games" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} />
                <input value={form.hobby} onChange={(e) => setForm({...form, hobby: e.target.value })} placeholder="Hobby" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} />
                <div style={{ gridColumn: '1 / span 2' }}><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value })} placeholder="Phone" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 7, fontSize: 13, boxSizing: 'border-box' }} /></div>
              </div>
              <button onClick={save} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 10, padding: 10, fontWeight: 700 }}><Save size={14} /> Save</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div>Bio: {userData.bio || 'Not set'}</div>
              <div>DOB: {userData.dob || 'Not set'}</div>
              <div>Village: {userData.village || 'Not set'}</div>
              <div>Games: {userData.favoriteGames || 'Not set'}</div>
              <div>Hobby: {userData.hobby || 'Not set'}</div>
              {(isOwn || userData.phonePublic) && userData.phone && <div>Phone: {userData.phone}</div>}
              <div>Email: {userData.email}</div>
            </div>
          )}
        </div>

        {showFriends && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>Friends ({friends.length})</h3>
            {friends.map((f: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ flex: 1, fontWeight: 700 }}>{f.name}</div>
                <button onClick={() => router.push('/chat/' + f.uid)} style={{ width: 36, height: 36, background: '#f3f0ff', border: 'none', borderRadius: 10 }}><MessageCircle size={16} color="#8d31ce" /></button>
              </div>
            ))}
          </div>
        )}

        {showRequests && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>Requests ({requests.length})</h3>
            {requests.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
                <div style={{ flex: 1, fontWeight: 700 }}>{r.fromName}</div>
                <button onClick={() => confirmReq(r.fromUid, r.id, r.fromName, r.fromPhoto)} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px' }}>Confirm</button>
                <button onClick={async () => await deleteDoc(doc(db, 'friendRequests', r.id))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 10px' }}><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
