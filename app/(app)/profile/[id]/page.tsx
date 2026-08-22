'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Ban, Edit3, Check, X, Mail, Calendar, MapPin, Phone, Video, Settings, Camera } from 'lucide-react';
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
    if (!isOwn ||!currentUser?.uid) return;
    setSaving(true);
    await updateDoc(doc(db, "users", currentUser.uid), {
      name: name.trim(),
      bio: bio.trim(),
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
    setEditMode(false);
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
      <div style={{ position: 'fixed', top: '135px', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #eee', borderTop: '3px solid #8d31ce', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: '135px', bottom: 0, left: 0, right: 0, background: '#f0f2f5', overflowY: 'auto', zIndex: 5 }}>

      {/* Cover */}
      <div style={{ height: '150px', background: 'linear-gradient(135deg,#8d31ce 0%,#a855f7 60%,#e9d5ff 100%)', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.25)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        {isOwn && (
          <button onClick={() => router.push('/setting')} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.25)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
            <Settings size={18} color="#fff" />
          </button>
        )}
      </div>

      {/* Card */}
      <div style={{ padding: '0 16px', marginTop: '-50px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', marginTop: '-50px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '26px', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', fontWeight: '800', border: '4px solid #fff', boxShadow: '0 6px 20px rgba(141,49,206,0.3)' }}>
                {(userData.name || 'U').charAt(0).toUpperCase()}
              </div>
              {isOnline(userData) && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '16px', height: '16px', background: '#22c55e', border: '3px solid #fff', borderRadius: '50%' }}></div>}
            </div>
            <div style={{ flex: 1, paddingBottom: '4px' }}>
              {isOwn && editMode? (
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', fontWeight: '800', fontSize: '18px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 8px' }} />
              ) : (
                <h1 style={{ margin: 0, fontSize: '19px', fontWeight: '800' }}>{userData.name}</h1>
              )}
              <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: '700', color: isOnline(userData)? '#22c55e' : '#999' }}>{isOnline(userData)? '● Online' : '○ Offline'}</p>
            </div>
            {isOwn? (
             !editMode? (
                <button onClick={() => setEditMode(true)} style={{ background: '#f3f0ff', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: '700', fontSize: '12px', color: '#8d31ce', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={14}/> Edit</button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditMode(false)} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></button>
                  <button onClick={handleSave} disabled={saving} style={{ background: '#8d31ce', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#fff"/></button>
                </div>
              )
            ) : null}
          </div>

          <div style={{ marginTop: '14px' }}>
            {isOwn && editMode? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio..." rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'none' }} />
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '20px' }}>{userData.bio || (isOwn? "Bio la awm lo, Edit hmangin ziak rawh." : "Bio a nei lo.")}</p>
            )}
          </div>

          {/* Buttons */}
          {!isOwn? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => router.push(`/chat/${profileId}`)} style={{ flex: 1, background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><MessageCircle size={18}/> Message</button>
              <button style={{ width: '44px', height: '44px', background: '#f3f0ff', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color="#8d31ce"/></button>
              <button onClick={handleBlock} style={{ width: '44px', height: '44px', background: '#fef2f2', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ban size={18} color="#ef4444"/></button>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '30px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><Mail size={16} color="#8d31ce"/>{userData.email || currentUser?.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><Calendar size={16} color="#8d31ce"/> Joined {userData.createdAt?.toDate? userData.createdAt.toDate().toLocaleDateString() : 'Recently'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}><MapPin size={16} color="#8d31ce"/> Mizoram, India</div>
        </div>
      </div>
    </div>
  );
                }
