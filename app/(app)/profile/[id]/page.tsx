'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Camera, Loader2, Gamepad2, Heart, Home, Cake, Save, X, Mail, Phone, Eye, EyeOff, FileText, UserPlus, Ban, Clock } from 'lucide-react';
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
    return onSnapCol(collection(db, 'users', profileId, 'friends'), (snap) => setFriends(snap.docs.map((d) => d.data())));
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
    const file = e.target.files?.[0]; if (!file) return;
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
      name: form.name.trim(), bio: form.bio.trim(), dob: form.dob, village: form.village.trim(),
      favoriteGames: form.games.trim(), hobby: form.hobby.trim(), phone: form.phone.trim(),
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
    await setDoc(doc(db, 'users', profileId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', profileId + '_' + currentUser.uid)); setStatus('friends');
  };
  const confirmReq = async (fromId: string, reqId: string, fromName: string, fromPhoto: string) => {
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', fromId), { uid: fromId, name: fromName, photoURL: fromPhoto, addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', fromId, 'friends', currentUser.uid), { uid: currentUser.uid, name: form.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
    await deleteDoc(doc(db, 'friendRequests', reqId));
  };

  if (!userData) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" color="#8d31ce" /></div>;

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 20 }}>
      <div style={{ height: 110, background: 'linear-gradient(135deg,#8d31ce,#a855f7)', borderRadius: '0 0 22px 22px' }} />

      {/* TOP CARD */}
      <div style={{ marginTop: -55, padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: 22, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }} onClick={() => isOwn && fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
              {userData.photoURL? <img src={userData.photoURL} style={{ width: 130, height: 130, borderRadius: 30, objectFit: 'cover', border: '4px solid #fff' }} alt="" /> : <div style={{ width: 130, height: 130, borderRadius: 30, background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, border: '4px solid #fff' }}>{(userData.name || 'U').charAt(0)}</div>}
              {isOwn && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, background: '#111', border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{uploading? <Loader2 size={12} color="#fff" className="animate-spin" /> : <Camera size={12} color="#fff" />}</div>}
            </div>
          </div>
          <h2 style={{ margin: '10px 0 0', fontSize: 20, fontWeight: 800 }}>{userData.name}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: '#22c55e' }}>● Online • {friends.length} Friends</p>

          {isOwn? (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => { setShowFriends(!showFriends); if (!showFriends) setShowRequests(false); }} style={{ flex: 1, background: showFriends? '#8d31ce' : '#f3f4f6', color: showFriends? '#fff' : '#333', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 800, fontSize: 14 }}>Friends ({friends.length})</button>
              <button onClick={() => { setShowRequests(!showRequests); if (!showRequests) setShowFriends(false); }} style={{ flex: 1, background: showRequests? '#8d31ce' : '#f3f4f6', color: showRequests? '#fff' : '#333', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 800, fontSize: 14 }}>Requests ({requests.length})</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => router.push('/chat/' + profileId)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><MessageCircle size={16} /> Chat</button>
              {status === 'none' && <button onClick={sendReq} style={{ flex: 1, background: '#e9e5ff', color: '#8d31ce', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><UserPlus size={16} /> Add Friend</button>}
              {status === 'pending' && <button onClick={cancelReq} style={{ flex: 1, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Clock size={14} /> Request Sent</button>}
              {status === 'incoming' && <button onClick={confirmIncoming} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14 }}>Confirm</button>}
              {status === 'friends' && <button style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: 12, padding: 11, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Ban size={14} /> Friends</button>}
            </div>
          )}
        </div>

        {/* 1. FRIENDS LIST - A HNUAI CHIAH AH - CLASS HRAN */}
        {isOwn && showFriends && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 12px', marginTop: 10 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Friends ({friends.length})</h3>
            {friends.length === 0? <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: 10 }}>Friend la nei lo</p> :
              friends.map((f: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i === friends.length -1? 'none' : '1px solid #f3f4f6' }}>
                  <div onClick={() => router.push('/profile/' + f.uid)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                    {f.photoURL? <img src={f.photoURL} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} alt="" /> : <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>{f.name?.charAt(0)}</div>}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Online</div>
                    </div>
                  </div>
                  <button onClick={() => router.push('/chat/' + f.uid)} style={{ width: 40, height: 40, background: '#f3f0ff', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} color="#8d31ce" /></button>
                </div>
              ))
            }
          </div>
        )}

        {/* REQUESTS LIST - A HNUAI CHIAH AH */}
        {isOwn && showRequests && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 12px', marginTop: 10 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Requests ({requests.length})</h3>
            {requests.length === 0? <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: 10 }}>Request awm lo</p> :
              requests.map((r: any) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div onClick={() => router.push('/profile/' + r.fromUid)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
                    {r.fromPhoto? <img src={r.fromPhoto} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} alt="" /> : <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{r.fromName?.charAt(0)}</div>}
                    <div><div style={{ fontSize: 15, fontWeight: 700 }}>{r.fromName}</div><div style={{ fontSize: 12, color: '#888' }}>Wants to be friends</div></div>
                  </div>
                  <button onClick={() => confirmReq(r.fromUid, r.id, r.fromName, r.fromPhoto)} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 12 }}>Confirm</button>
                  <button onClick={async () => await deleteDoc(doc(db, 'friendRequests', r.id))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* 2. ABOUT - FONT LIAN + ICON */}
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>About</h3>
            {isOwn &&!editAbout && <span onClick={() => setEditAbout(true)} style={{ fontSize: 13, fontWeight: 700, color: '#8d31ce', cursor: 'pointer' }}>Edit</span>}
          </div>

          {isOwn && editAbout? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value })} rows={2} placeholder="Bio" style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="date" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value })} style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                <input value={form.village} onChange={(e) => setForm({...form, village: e.target.value })} placeholder="Village" style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                <input value={form.games} onChange={(e) => setForm({...form, games: e.target.value })} placeholder="Favorite Games" style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                <input value={form.hobby} onChange={(e) => setForm({...form, hobby: e.target.value })} placeholder="Hobby" style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value })} placeholder="Phone Number" style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 10, padding: '10px 36px 10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                <span onClick={() => setForm({...form, phonePublic:!form.phonePublic })} style={{ position: 'absolute', right: 10, top: 10, cursor: 'pointer' }}>{form.phonePublic? <Eye size={18} color="#22c55e" /> : <EyeOff size={18} color="#999" />}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: -6 }}>{form.phonePublic? 'Public - mi zawngin an hmu thei' : 'Private - nangmah chauh in i hmu'}</div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setEditAbout(false)} style={{ flex: 1, background: '#f3f4f6', color: '#333', border: 'none', borderRadius: 12, padding: 12, fontWeight: 700, fontSize: 14 }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: 12, padding: 12, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{saving? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, background: '#f5f3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={18} color="#8d31ce" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Bio</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.bio || 'Ka account thar'}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#fef3f2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cake size={18} color="#ef4444" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Date of Birth</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.dob || 'Not set'}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={18} color="#22c55e" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Village</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.village || 'Not set'}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gamepad2 size={18} color="#3b82f6" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Favorite Games</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.favoriteGames || 'Not set'}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#fdf2f8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={18} color="#ec4899" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Hobby</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.hobby || 'Not set'}</div></div>
              </div>
              {(isOwn || userData.phonePublic) && userData.phone && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color="#22c55e" /></div>
                  <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Phone {userData.phonePublic? '(Public)' : '(Private)'}</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{userData.phone}</div></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#f3f0ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color="#8d31ce" /></div>
                <div><div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>Email</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3, wordBreak: 'break-all' }}>{userData.email}</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
