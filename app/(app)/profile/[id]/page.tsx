'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Camera, Loader2, Gamepad2, Heart, Home, UserPlus, Users, Cake, Save, Check, X, Clock, Mail, Phone, Eye, EyeOff, FileText, Edit3 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (u) setCurrentUser(u); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!profileId) return;
    const unsub = onSnapshot(doc(db, 'users', profileId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData({ id: snap.id,...d });
        setForm({
          name: d.name || '',
          bio: d.bio || '',
          dob: d.dob || '',
          village: d.village || '',
          games: d.favoriteGames || '',
          hobby: d.hobby || '',
          phone: d.phone || '',
          phonePublic: d.phonePublic || false
        });
      }
    });
    return () => unsub();
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    const unsub = onSnapCol(collection(db, 'users', profileId, 'friends'), (snap) => {
      setFriends(snap.docs.map((d) => d.data()));
    });
    return () => unsub();
  }, [profileId]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'friendRequests'), where('toUid', '==', currentUser.uid));
    const unsub = onSnapCol(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id,...d.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid ||!profileId || currentUser.uid === profileId) return;
    const check = async () => {
      const f = await getDoc(doc(db, 'users', currentUser.uid, 'friends', profileId));
      if (f.exists()) { setStatus('friends'); return; }
      const out = await getDoc(doc(db, 'friendRequests', `${currentUser.uid}_${profileId}`));
      if (out.exists()) { setStatus('pending'); return; }
      const inc = await getDoc(doc(db, 'friendRequests', `${profileId}_${currentUser.uid}`));
      if (inc.exists()) { setStatus('incoming'); return; }
      setStatus('none');
    };
    check();
  }, [currentUser, profileId]);

  const isOwn = currentUser?.uid === profileId;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > 500) { h = (h * 500) / w; w = 500; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const b64 = await compressImage(file);
    await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: b64 });
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'users', currentUser.uid), {
      name: form.name.trim(),
      bio: form.bio.trim(),
      dob: form.dob,
      village: form.village.trim(),
      favoriteGames: form.games.trim(),
      hobby: form.hobby.trim(),
      phone: form.phone.trim(),
      phonePublic: form.phonePublic,
      updatedAt: serverTimestamp()
    });
    setSaving(false);
    setEditAbout(false);
  };

  const sendReq = async () => {
    await setDoc(doc(db, 'friendRequests', `${currentUser.uid}_${profileId}`), {
      fromUid: currentUser.uid, toUid: profileId,
      fromName: form.name, fromPhoto: userData.photoURL || '',
      toName: userData.name, createdAt: serverTimestamp()
    });
    setStatus('pending');
  };

  const cancelReq = async () => {
    await deleteDoc(doc(db, 'friendRequests', `${currentUser.uid}_${profileId}`));
    setStatus('none');
  };

  const confirmIncoming = async () => {
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', profileId), { uid: profileId, name: userData.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', profileId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: currentUser.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', `${profileId}_${currentUser.uid}`));
    setStatus('friends');
  };

  const confirmReq = async (fromId: string, reqId: string, fromName: string, fromPhoto: string) => {
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', fromId), { uid: fromId, name: fromName, photoURL: fromPhoto, addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', fromId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', reqId));
  };

  if (!userData) {
    return <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#8d31ce" /></div>;
  }

  const canSeePhone = isOwn || userData.phonePublic;

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 30 }}>
      <div style={{ height: 110, background: 'linear-gradient(135deg,#8d31ce,#a855f7)', borderRadius: '0 0 22px 22px' }}></div>

      <div style={{ marginTop: -55, padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: 22, padding: '16px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }} onClick={() => isOwn && fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {userData.photoURL? (
                <img src={userData.photoURL} style={{ width: 130, height: 130, borderRadius: 30, objectFit: 'cover', border: '4px solid #fff' }} alt="" />
              ) : (
                <div style={{ width: 130, height: 130, borderRadius: 30, background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, border: '4px solid #fff' }}>{(userData.name || 'U').charAt(0)}</div>
              )}
              {isOwn && (
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, background: '#111', border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {uploading? <Loader2 size={12} color="#fff" className="animate-spin" /> : <Camera size={12} color="#fff" />}
                </div>
              )}
            </div>
          </div>
          {editAbout? (
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} style={{ marginTop: 10, width: '80%', textAlign: 'center', fontSize: 18, fontWeight: 800, border: '1.5px solid #ddd', borderRadius: 10, padding: 6 }} />
          ) : (
            <h2 style={{ margin: '10px 0 0', fontSize: 19, fontWeight: 800 }}>{userData.name}</h2>
          )}
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>● Online • {friends.length} Friends</p>

          {isOwn? (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
              <button onClick={() => { setShowFriends(!showFriends); setShowRequests(false); }} style={{ flex: 1, background: showFriends? '#8d31ce' : 'transparent', color: showFriends? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>Friends ({friends.length})</button>
              <button onClick={() => { setShowRequests(!showRequests); setShowFriends(false); }} style={{ flex: 1, background: showRequests? '#8d31ce' : 'transparent', color: showRequests? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>Requests ({requests.length})</button>
              <button onClick={() => setEditAbout(!editAbout)} style={{ flex: 1, background: editAbout? '#111' : 'transparent', color: editAbout? '#fff' : '#666', border: 'none', borderRadius: 9, padding: '8px 4px', fontWeight: 800, fontSize: 12 }}>{editAbout? 'Cancel' : 'Edit Profile'}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => router.push(`/chat/${profileId}`)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14 }}>Chat</button>
              {status === 'none' && <button onClick={sendReq} style={{ flex: 1, background: '#e9e5ff', color: '#8d31ce', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14 }}>Add Friend</button>}
              {status === 'pending' && <button onClick={cancelReq} style={{ flex: 1, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 12 }}>Requested</button>}
              {status === 'incoming' && <button onClick={confirmIncoming} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14 }}>Confirm</button>}
              {status === 'friends' && <button style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14 }}>Friends</button>}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>About</h3>
            {isOwn &&!editAbout && (
              <button onClick={() => setEditAbout(true)} style={{ background: '#f3f0ff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#8d31ce', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={12} /> Edit</button>
            )}
          </div>

          {isOwn && editAbout? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={{ fontSize: 11, color: '#888' }}>Bio</label><textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value })} rows={2} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box', resize: 'none' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={{ fontSize: 11, color: '#888' }}>DOB</label><input type="date" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value })} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: 11, color: '#888' }}>Village</label><input value={form.village} onChange={(e) => setForm({...form, village: e.target.value })} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: 11, color: '#888' }}>Games</label><input value={form.games} onChange={(e) => setForm({...form, games: e.target.value })} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: 11, color: '#888' }}>Hobby</label><input value={form.hobby} onChange={(e) => setForm({...form, hobby: e.target.value })} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box' }} /></div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ fontSize: 11, color: '#888', display: 'flex', justifyContent: 'space-between' }}>Phone <span onClick={() => setForm({...form, phonePublic:!form.phonePublic })} style={{ color: form.phonePublic? '#22c55e' : '#999', cursor: 'pointer' }}>{form.phonePublic? 'Public' : 'Private'}</span></label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value })} placeholder="9862..." style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 8px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setEditAbout(false)} style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 9, fontWeight: 700, fontSize: 13 }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 10, padding: 9, fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'center', gap: 5 }}>{saving? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save</>}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#f5f3ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} color="#8d31ce" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Bio</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.bio || 'Ka account thar'}</div></div></div>
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#fef3f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cake size={14} color="#ef4444" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Date of Birth</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.dob || 'Not set'}</div></div></div>
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={14} color="#22c55e" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Village</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.village || 'Not set'}</div></div></div>
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gamepad2 size={14} color="#3b82f6" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Favorite Games</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.favoriteGames || 'Not set'}</div></div></div>
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#fdf2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={14} color="#ec4899" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Hobby</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.hobby || 'Not set'}</div></div></div>
              {canSeePhone && userData.phone && <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={14} color="#22c55e" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Phone {userData.phonePublic? '(Public)' : '(Private)'}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.phone}</div></div></div>}
              <div style={{ display: 'flex', gap: 10 }}><div style={{ width: 32, height: 32, background: '#f3f0ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={14} color="#8d31ce" /></div><div><div style={{ fontSize: 11, color: '#999' }}>Email</div><div style={{ fontSize: 13, fontWeight: 600 }}>{userData.email}</div></div></div>
            </div>
          )}
        </div>

        {showFriends && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>Friends ({friends.length})</h3>
            {friends.map((f: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div onClick={() => router.push(`/profile/${f.uid}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                  {f.photoURL? <img src={f.photoURL} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} alt="" /> : <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{f.name?.charAt(0)}</div>}
                  <div><div style={{ fontSize: 14, fontWeight: 700 }}>{f.name}</div><div style={{ fontSize: 11, color: '#22c55e' }}>● Online</div></div>
                </div>
                <button onClick={() => router.push(`/chat/${f.uid}`)} style={{ width: 36, height: 36, background: '#f3f0ff', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={16} color="#8d31ce" /></button>
              </div>
            ))}
          </div>
        )}

        {showRequests && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>Friend Requests ({requests.length})</h3>
            {requests.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  {r.fromPhoto? <img src={r.fromPhoto} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} a
