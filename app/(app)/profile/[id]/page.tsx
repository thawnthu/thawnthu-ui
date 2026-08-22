'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Ban, Edit3, Check, X, Mail, Calendar, MapPin, Camera, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  // PROFILE PIC UPLOAD - Firebase Storage
  const handlePicClick = () => {
    if (!isOwn) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file ||!currentUser?.uid) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File lian lutuk - 5MB ai a tlem zawk thlang rawh");
      return;
    }
    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePics/${currentUser.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoURL: url,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      // Storage enable loh chuan base64 in Firestore ah dah mai
      console.log("Storage error, using base64 fallback", err);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            photoURL: reader.result as string,
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          alert("Upload failed: " + err.message);
        }
      };
      reader.readAsDataURL(file);
    }
    setUploading(false);
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
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: '30px' }}>

      {/* Cover - Fixed overlap bo tawh */}
      <div style={{
        height: '130px',
        background: 'linear-gradient(135deg,#8d31ce 0%,#a855f7 60%,#e9d5ff 100%)',
        position: 'relative',
        margin: '0 -16px',
        marginTop: '-16px'
      }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '12px', left: '16px', background: 'rgba(0,0,0,0.25)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
      </div>

      {/* Card */}
      <div style={{ padding: '0 4px', marginTop: '-45px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '18px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', marginTop: '-45px' }}>
            <div style={{ position: 'relative' }} onClick={handlePicClick}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              {userData.photoURL? (
                <img src={userData.photoURL} alt="profile" style={{ width: '84px', height: '84px', borderRadius: '22px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }} />
              ) : (
                <div style={{ width: '84px', height: '84px', borderRadius: '22px', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', border: '4px solid #fff', boxShadow: '0 6px 20px rgba(141,49,206,0.3)' }}>
                  {(userData.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {isOwn && (
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '28px', height: '28px', background: '#111', border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {uploading? <Loader2 size={12} color="#fff" className="animate-spin" /> : <Camera size={12} color="#fff" />}
                </div>
              )}
              {isOnline(userData) &&!isOwn && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid #fff', borderRadius: '50%' }}></div>}
            </div>

            <div style={{ flex: 1, paddingBottom: '4px' }}>
              {isOwn && editMode? (
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', fontWeight: '800', fontSize: '17px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 8px' }} />
              ) : (
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', lineHeight: '18px' }}>{userData.name}</h1>
              )}
              <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: '700', color: isOnline(userData)? '#22c55e' : '#999' }}>{isOnline(userData)? '● Online' : '○ Offline'}</p>
            </div>

            {isOwn? (
             !editMode? (
                <button onClick={() => setEditMode(true)} style={{ background: '#f3f0ff', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: '700', fontSize: '12px', color: '#8d31ce', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={14}/> Edit</button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditMode(false)} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></button>
                  <button onClick={handleSave} disabled={saving} style={{ background: '#8d31ce', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{saving? <Loader2 size={14} color="#fff" className="animate-spin"/> : <Check size={14} color="#fff"/>}</button>
                </div>
              )
            ) : null}
          </div>

          <div style={{ marginTop: '14px' }}>
            {isOwn && editMode? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio ziak rawh..." rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'none' }} />
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '20px' }}>{userData.bio || (isOwn? "Bio la awm lo, Edit hmangin ziak rawh." : "Bio a nei lo.")}</p>
            )}
          </div>

          {!isOwn && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => router.push(`/chat/${profileId}`)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageCircle size={18}/> Message</button>
              <button onClick={handleBlock} style={{ width: '44px', height: '44px', background: '#fef2f2', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ban size={18} color="#ef4444"/></button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 4px 0 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><Mail size={16} color="#8d31ce"/>{userData.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><Calendar size={16} color="#8d31ce"/> Joined {userData.createdAt?.toDate? userData.createdAt.toDate().toLocaleDateString('en-GB') : '21/08/2026'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><MapPin size={16} color="#8d31ce"/> Mizoram, India</div>
        </div>

        {isOwn && (
          <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '8px' }}>Profile pic chu a chung a camera icon kha click la thlang rawh</p>
        )}
      </div>
    </div>
  );
                                                                                                                 }
