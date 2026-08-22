'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Ban, Edit3, Check, X, Mail, Calendar, MapPin, Camera, Loader2, Gamepad2, Heart, Home, UserPlus, Users, Cake, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, query, onSnapshot as onSnapCol, serverTimestamp, deleteDoc } from 'firebase/firestore';
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
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setCurrentUser(u); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!profileId) return;
    const unsub = onSnapshot(doc(db, "users", profileId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({ id: snap.id,...data });
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          dob: data.dob || '',
          village: data.village || '',
          games: data.favoriteGames || '',
          hobby: data.hobby || '',
        });
      }
    });
    return () => unsub();
  }, [profileId]);

  // Friends list
  useEffect(() => {
    if (!profileId) return;
    const q = collection(db, "users", profileId, "friends");
    const unsub = onSnapCol(q, snap => {
      setFriends(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, [profileId]);

  // Check friend status
  useEffect(() => {
    if (!currentUser?.uid ||!profileId || currentUser.uid === profileId) return;
    const check = async () => {
      const fDoc = await getDoc(doc(db, "users", currentUser.uid, "friends", profileId));
      if (fDoc.exists()) setFriendStatus('friends');
      else {
        const req = await getDoc(doc(db, "friendRequests", `${currentUser.uid}_${profileId}`));
        if (req.exists()) setFriendStatus('pending');
        else setFriendStatus('none');
      }
    };
    check();
  }, [currentUser, profileId, friends]);

  const isOwn = currentUser?.uid === profileId;
  const isOnline = (u: any) => {
    if (!u?.online ||!u?.lastSeen) return false;
    try { const last = u.lastSeen.toDate? u.lastSeen.toDate() : new Date(u.lastSeen); return Date.now() - last.getTime() < 120 * 1000; } catch { return false; }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > 400) { h = (h * 400) / w; w = 400; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file ||!currentUser?.uid) return;
    setUploading(true);
    const base64 = await compressImage(file);
    await updateDoc(doc(db, "users", currentUser.uid), { photoURL: base64, updatedAt: serverTimestamp() });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!isOwn) return;
    setSaving(true);
    await updateDoc(doc(db, "users", currentUser.uid), {
      name: form.name.trim(),
      bio: form.bio.trim(),
      dob: form.dob,
      village: form.village.trim(),
      favoriteGames: form.games.trim(),
      hobby: form.hobby.trim(),
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
    setEditMode(false);
  };

  const handleAddFriend = async () => {
    if (!currentUser?.uid || isOwn) return;
    if (friendStatus === 'friends') {
      if (!confirm("Friend atanga remove i duh em?")) return;
      await deleteDoc(doc(db, "users", currentUser.uid, "friends", profileId));
      await deleteDoc(doc(db, "users", profileId, "friends", currentUser.uid));
      setFriendStatus('none');
    } else {
      await setDoc(doc(db, "users", currentUser.uid, "friends", profileId), { uid: profileId, name: userData.name, photoURL: userData.photoURL || '', addedAt: serverTimestamp() });
      await setDoc(doc(db, "users", profileId, "friends", currentUser.uid), { uid: currentUser.uid, name: currentUser.displayName || 'User', addedAt: serverTimestamp() });
      setFriendStatus('friends');
    }
  };

  const handleBlock = async () => {
    if (isOwn) return;
    if (!confirm(`${userData?.name} block?`)) return;
    await setDoc(doc(db, "users", currentUser.uid, "blocked", profileId), { uid: profileId, blockedAt: serverTimestamp() });
    router.push('/users');
  };

  if (!userData) return <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={28} color="#8d31ce" /></div>;

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 135px)', paddingBottom: '30px' }}>

      {/* Cover */}
      <div style={{ height: '120px', background: 'linear-gradient(135deg,#8d31ce,#a855f7,#d8b4fe)', borderRadius: '0 0 24px 24px' }}></div>

      {/* Center Big Pic Card */}
      <div style={{ marginTop: '-60px', padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '20px 16px 16px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', textAlign: 'center' }}>

          {/* PIC LAI AH LIAN */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-10px' }}>
            <div style={{ position: 'relative' }} onClick={() => isOwn && fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              {userData.photoURL? (
                <img src={userData.photoURL} style={{ width: '110px', height: '110px', borderRadius: '30px', objectFit: 'cover', border: '5px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} alt="" />
              ) : (
                <div style={{ width: '110px', height: '110px', borderRadius: '30px', background: 'linear-gradient(135deg,#8d31ce,#a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '800', border: '5px solid #fff', boxShadow: '0 8px 24px rgba(141,49,206,0.3)' }}>
                  {(userData.name||'U').charAt(0).toUpperCase()}
                </div>
              )}
              {isOwn && (
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '30px', height: '30px', background: '#111', border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {uploading? <Loader2 size={14} color="#fff" className="animate-spin"/> : <Camera size={14} color="#fff"/>}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            {editMode? (
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '80%', textAlign: 'center', fontSize: '18px', fontWeight: '800', border: '1px solid #ddd', borderRadius: '10px', padding: '6px' }} />
            ) : (
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{userData.name}</h1>
            )}
            <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: '700', color: isOnline(userData)? '#22c55e' : '#999' }}>{isOnline(userData)? '● Online' : '○ Offline'} • {friends.length} Friends</p>
          </div>

          {/* Bio */}
          <div style={{ marginTop: '12px', background: '#f8f5ff', borderRadius: '12px', padding: '10px 12px' }}>
            {editMode? (
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio..." rows={2} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', fontSize: '13px', resize: 'none' }} />
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '18px' }}>{userData.bio || "Bio awm lo."}</p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'center' }}>
            {isOwn? (
             !editMode? (
                <button onClick={() => setEditMode(true)} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Edit3 size={16}/> Edit Profile</button>
              ) : (
                <>
                  <button onClick={() => setEditMode(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={14}/> Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>{saving? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save</button>
                </>
              )
            ) : (
              <>
                <button onClick={() => router.push(`/chat/${profileId}`)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '12px', padding: '11px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageCircle size={16}/> Message</button>
                <button onClick={handleAddFriend} style={{ flex: 1, background: friendStatus==='friends'? '#f3f4f6' : '#e9e5ff', color: friendStatus==='friends'? '#111' : '#8d31ce', border: 'none', borderRadius: '12px', padding: '11px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {friendStatus==='friends'? <><Users size={16}/> Friends</> : <><UserPlus size={16}/> Add Friend</>}
                </button>
                <button onClick={handleBlock} style={{ width: '42px', background: '#fef2f2', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ban size={16} color="#ef4444"/></button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 12px 0 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '800', color: '#111' }}>About</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#f3f0ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={14} color="#8d31ce"/></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '11px', color: '#999' }}>Email</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.email}</div></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fef3f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cake size={14} color="#ef4444"/></div>
              <div style={{ flex: 1 }}>{editMode? <><div style={{ fontSize: '11px', color: '#999' }}>Date of Birth</div><input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }} /></> : <><div style={{ fontSize: '11px', color: '#999' }}>Date of Birth</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.dob || 'Not set'}</div></>}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={14} color="#22c55e"/></div>
              <div style={{ flex: 1 }}>{editMode? <><div style={{ fontSize: '11px', color: '#999' }}>Village / Khua</div><input value={form.village} onChange={e => setForm({...form, village: e.target.value})} placeholder="Aizawl" style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }} /></> : <><div style={{ fontSize: '11px', color: '#999' }}>Village</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.village || 'Mizoram, India'}</div></>}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gamepad2 size={14} color="#3b82f6"/></div>
              <div style={{ flex: 1 }}>{editMode? <><div style={{ fontSize: '11px', color: '#999' }}>Favorite Games</div><input value={form.games} onChange={e => setForm({...form, games: e.target.value})} placeholder="PUBG, ML, etc" style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }} /></> : <><div style={{ fontSize: '11px', color: '#999' }}>Favorite Games</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.favoriteGames || 'Not set'}</div></>}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fdf2f8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={14} color="#ec4899"/></div>
              <div style={{ flex: 1 }}>{editMode? <><div style={{ fontSize: '11px', color: '#999' }}>Hobby</div><input value={form.hobby} onChange={e => setForm({...form, hobby: e.target.value})} placeholder="Music, Football" style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }} /></> : <><div style={{ fontSize: '11px', color: '#999' }}>Hobby</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.hobby || 'Not set'}</div></>}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={14} color="#8d31ce"/></div>
              <div><div style={{ fontSize: '11px', color: '#999' }}>Joined</div><div style={{ fontSize: '13px', fontWeight: '600' }}>{userData.createdAt?.toDate? userData.createdAt.toDate().toLocaleDateString('en-GB') : '21/08/2026'}</div></div>
            </div>

          </div>
        </div>

        {/* Friend List */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>Friends ({friends.length})</h3>
            <span style={{ fontSize: '11px', color: '#8d31ce', fontWeight: '700' }}>See All</span>
          </div>
          {friends.length === 0? (
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '12px 0' }}>Friend la nei lo</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {friends.slice(0,6).map((f: any, i: number) => (
                <div key={i} onClick={() => router.push(`/profile/${f.uid}`)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                  {f.photoURL? <img src={f.photoURL} style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover' }} alt="" /> : <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', margin: '0 auto' }}>{f.name?.charAt(0)}</div>}
                  <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
      }
