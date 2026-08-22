'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, Ban, Edit3, Check, X, Mail, Calendar, MapPin, Camera, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UniversalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        setName(data.name || '');
        setBio(data.bio || '');
      }
    });
    return () => unsub();
  }, [profileId]);

  const isOwn = currentUser?.uid === profileId;
  const isOnline = (u: any) => {
    if (!u?.online ||!u?.lastSeen) return false;
    try {
      const last = u.lastSeen.toDate? u.lastSeen.toDate() : new Date(u.lastSeen);
      return Date.now() - last.getTime() < 120 * 1000;
    } catch { return false; }
  };

  const handleSave = async () => {
    if (!isOwn) return;
    setSaving(true);
    await updateDoc(doc(db, "users", currentUser.uid), {
      name: name.trim(),
      bio: bio.trim(),
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
    setEditMode(false);
  };

  // IMAGE COMPRESS - Storage ngai lo, Firestore ah direct lang nghal
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > 300) {
            height = (height * 300) / width;
            width = 300;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePicClick = () => {
    if (!isOwn || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file ||!currentUser?.uid) return;
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoURL: base64,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBlock = async () => {
    if (isOwn ||!currentUser?.uid) return;
    if (!confirm(`${userData?.name} block i duh em?`)) return;
    await setDoc(doc(db, "users", currentUser.uid, "blocked", profileId), {
      uid: profileId, name: userData?.name, blockedAt: serverTimestamp(),
    });
    router.push('/users');
  };

  if (!userData) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={28} color="#8d31ce" />
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 135px)', paddingBottom: '30px' }}>

      {/* Cover - arrow bo tawh, a pil tawh lo */}
      <div style={{
        height: '100px',
        background: 'linear-gradient(135deg,#8d31ce 0%,#a855f7 100%)',
        borderRadius: '0 0 20px 20px',
      }}>
      </div>

      {/* Card - pil tawh lo */}
      <div style={{ marginTop: '-40px', padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', marginTop: '-28px', flexShrink: 0 }} onClick={handlePicClick}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              {userData.photoURL? (
                <img src={userData.photoURL} alt="profile" style={{ width: '78px', height: '78px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'block' }} />
              ) : (
                <div style={{ width: '78px', height: '78px', borderRadius: '20px', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {(userData.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {isOwn && (
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '24px', height: '24px', background: '#111', border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {uploading? <Loader2 size={10} color="#fff" className="animate-spin" /> : <Camera size={10} color="#fff" />}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
              {isOwn && editMode? (
                <input value={name} onChange={e => setName(e.target.value)} autoFocus style={{ width: '100%', fontWeight: '700', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 8px' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#111', lineHeight: '17px' }}>{userData.name}</h1>
                  {isOwn &&!editMode && (
                    <button onClick={() => setEditMode(true)} style={{ background: '#f3f0ff', border: 'none', borderRadius: '8px', padding: '4px 8px', fontWeight: '700', fontSize: '11px', color: '#8d31ce', display: 'flex', alignItems: 'center', gap: '3px' }}><Edit3 size={12}/> Edit</button>
                  )}
                  {isOwn && editMode && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => setEditMode(false)} style={{ background: '#f3f4f6', border: 'none', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12}/></button>
                      <button onClick={handleSave} disabled={saving} style={{ background: '#8d31ce', border: 'none', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{saving? <Loader2 size={12} color="#fff" className="animate-spin"/> : <Check size={12} color="#fff"/>}</button>
                    </div>
                  )}
                </div>
              )}
              <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: '700', color: isOnline(userData)? '#22c55e' : '#999' }}>{isOnline(userData)? '● Online' : '○ Offline'}</p>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            {isOwn && editMode? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio ziak rawh..." rows={2} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '10px', padding: '8px 10px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '18px' }}>{userData.bio || (isOwn? "Bio la awm lo, Edit hmangin ziak rawh." : "Bio a nei lo.")}</p>
            )}
          </div>

          {!isOwn && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button onClick={() => router.push(`/chat/${profileId}`)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageCircle size={16}/> Message</button>
              <button onClick={handleBlock} style={{ width: '40px', height: '40px', background: '#fef2f2', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ban size={16} color="#ef4444"/></button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 12px 0 12px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}><Mail size={14} color="#8d31ce"/>{userData.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}><Calendar size={14} color="#8d31ce"/> Joined {userData.createdAt?.toDate? userData.createdAt.toDate().toLocaleDateString('en-GB') : '21/08/2026'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}><MapPin size={14} color="#8d31ce"/> Mizoram, India</div>
        </div>
        {isOwn && <p style={{ fontSize: '10px', color: '#aaa', textAlign: 'center', marginTop: '10px' }}>Pic thlak duh chuan pic kha click rawh</p>}
      </div>
    </div>
  );
                }
