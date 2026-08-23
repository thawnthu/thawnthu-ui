'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Image as ImageIcon, X, Eye, Send } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, setDoc, getDoc, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type StatusItem = {
  id: string;
  userId: string;
  name: string;
  text?: string;
  imageUrl?: string;
  createdAt: any;
  viewers?: any[];
};

export default function StatusPage() {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewStatus, setViewStatus] = useState<StatusItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setCurrentUid(u.uid);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setCurrentUserData({ id: snap.id,...snap.data() });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUid) return;
    const unsub1 = onSnapshot(collection(db, "users", currentUid, "friends"), s => {
      const ids = s.docs.map(d => d.id);
      if (ids.length > 0) setFriendIds(ids);
    });
    const unsub2 = onSnapshot(doc(db, "users", currentUid), s => {
      if (s.exists()) {
        const data = s.data() as any;
        if (data.friends?.length > 0) setFriendIds(data.friends);
        else if (data.following?.length > 0) setFriendIds(prev => prev.length > 0? prev : data.following);
      }
    });
    const q = query(collection(db, "friendships"), where("participants", "array-contains", currentUid));
    const unsub3 = onSnapshot(q, s => {
      const ids: string[] = [];
      s.docs.forEach(d => {
        const data = d.data() as any;
        const other = data.participants.find((p: string) => p!== currentUid);
        if (other && (data.status === 'accepted' ||!data.status)) ids.push(other);
      });
      if (ids.length > 0) setFriendIds(ids);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [currentUid]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), s => {
      const map: any = {};
      s.docs.forEach(d => { map[d.id] = { id: d.id,...d.data() }; });
      setUsersMap(map);
    });
    return () => unsub();
  }, []);

  // Status realtime - friends te + keimah chiah, 24h chhung mi chiah
  useEffect(() => {
    if (!currentUid) return;
    const q = query(collection(db, "statuses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const now = Date.now();
      const list: StatusItem[] = [];
      snap.docs.forEach(d => {
        const data = d.data() as any;
        const created = data.createdAt?.toDate?.()?.getTime() || 0;
        if (now - created > 24 * 60 * 60 * 1000) return; // 24h expire
        // Keimah + friend te chiah en thei
        if (data.userId!== currentUid && friendIds.length > 0 &&!friendIds.includes(data.userId)) return;
        if (data.userId!== currentUid && friendIds.length === 0) {
          // friend list awm lo chuan tumah status en thei lo - keimah chiah
          return;
        }
        list.push({ id: d.id,...data });
      });
      setStatuses(list);
    });
    return () => unsub();
  }, [currentUid, friendIds]);

  const getInitial = (n: string) => n?.charAt(0).toUpperCase() || '?';
  const getColor = (n: string) => ['#2563eb','#ef4444','#ff6b35','#f59e0b','#8d31ce'][(n?.length || 0) % 5];
  const formatTime = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate? ts.toDate() : new Date(ts);
      const diff = Date.now() - d.getTime();
      const h = Math.floor(diff / 3600000);
      if (h < 1) return `${Math.floor(diff/60000)}m ago`;
      if (h < 24) return `${h}h ago`;
      return d.toLocaleDateString();
    } catch { return ''; }
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddStatus = async () => {
    if (!text.trim() &&!imageFile) return;
    if (!currentUid) return;
    setUploading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storage = getStorage();
        const r = ref(storage, `status/${currentUid}_${Date.now()}_${imageFile.name}`);
        await uploadBytes(r, imageFile);
        imageUrl = await getDownloadURL(r);
      }
      await addDoc(collection(db, "statuses"), {
        userId: currentUid,
        name: currentUserData?.name || 'You',
        text: text.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
        viewers: [],
      });
      setText('');
      setImageFile(null);
      setPreview('');
      setShowAdd(false);
    } catch (e: any) { alert(e.message); }
    setUploading(false);
  };

  const handleView = async (st: StatusItem) => {
    setViewStatus(st);
    if (st.userId === currentUid) return;
    try {
      await updateDoc(doc(db, "statuses", st.id), {
        viewers: arrayUnion({ uid: currentUid, name: currentUserData?.name || 'User', viewedAt: new Date() })
      });
    } catch {}
  };

  const myStatuses = statuses.filter(s => s.userId === currentUid);
  const friendsStatuses = statuses.filter(s => s.userId!== currentUid);

  const highlightText = (t: string, q: string) => {
    if (!q ||!t) return t;
    try {
      const regex = new RegExp(`(${q})`, 'gi');
      const parts = t.split(regex);
      return parts.map((p, i) => regex.test(p)? <span key={i} style={{ background: '#ffeb3b', color: '#000', fontWeight: 700, borderRadius: '3px', padding: '0 2px' }}>{p}</span> : p);
    } catch { return t; }
  };

  const filteredFriends = friendsStatuses.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.text?.toLowerCase().includes(q);
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 130px)' }}>
      {/* Search ding reng */}
      <div style={{ position: 'sticky', top: '55px', zIndex: 15, padding: '10px 12px 12px 12px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px 16px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
          <Search size={20} color="#888" />
          <input type="text" placeholder="Search status..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Ka status */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div onClick={() => myStatuses[0] && handleView(myStatuses[0])} style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: getColor(currentUserData?.name || 'Y'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', border: myStatuses.length > 0? '3px solid #8d31ce' : '3px solid #eee' }}>
                  {getInitial(currentUserData?.name || 'Y')}
                </div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '22px', height: '22px', borderRadius: '50%', background: '#8d31ce', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  <Plus size={12} color="#fff" />
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '16px' }}>My Status</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#888' }}>{myStatuses.length > 0? `${myStatuses.length} status • ${formatTime(myStatuses[0].createdAt)}` : 'Tap to add status'}</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(true)} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}>Add</button>
          </div>
        </div>

        {/* Friends status */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, padding: '12px 14px', fontWeight: '800', fontSize: '14px', color: '#666', borderBottom: '1px solid #f0f0f0' }}>Friends Status ({filteredFriends.length})</p>
          {filteredFriends.length === 0? (
            <p style={{ textAlign: 'center', color: '#888', padding: '30px 20px', margin: 0, fontSize: '14px' }}>{search? `No status for "${search}"` : friendIds.length === 0? 'Friend list awm lo - Users atangin friend add rawh' : 'I friends te status an nei lo'}</p>
          ) : filteredFriends.map(st => {
            const isViewed = st.viewers?.some((v: any) => v.uid === currentUid);
            return (
              <div key={st.id} onClick={() => handleView(st)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: isViewed? '#fff' : '#f8f5ff' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', padding: '2px', border: `3px solid ${isViewed? '#ddd' : '#8d31ce'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: getColor(st.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                    {st.imageUrl? <img src={st.imageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitial(st.name)}
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: isViewed? '600' : '800', fontSize: '15px' }}>{highlightText(st.name, search)}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.text? highlightText(st.text, search) : 'Photo'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{formatTime(st.createdAt)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                    <Eye size={12} color="#888" />
                    <span style={{ fontSize: '11px', color: '#888' }}>{st.viewers?.length || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Status Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: '800' }}>New Status</h3>
              <button onClick={() => setShowAdd(false)} style={{ border: 'none', background: '#f0f0f0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enge i ngaihtuah? (thu ziak tawp pawh theih)" style={{ width: '100%', minHeight: '100px', borderRadius: '12px', border: '1px solid #ddd', padding: '12px', fontSize: '15px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            {preview && (<div style={{ position: 'relative', marginTop: '12px' }}><img src={preview} alt="" style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} /><button onClick={() => { setImageFile(null); setPreview(''); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} color="#fff" /></button></div>)}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: '#fff', fontWeight: '700', cursor: 'pointer' }}><ImageIcon size={18} /> Photo</button>
              <button onClick={handleAddStatus} disabled={uploading || (!text.trim() &&!imageFile)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: 'none', background: (!text.trim() &&!imageFile) || uploading? '#ccc' : '#8d31ce', color: '#fff', fontWeight: '700', cursor: 'pointer' }}><Send size={18} /> {uploading? 'Posting...' : 'Post'}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#888', textAlign: 'center' }}>I friends te chiah in an hmu thei ang • 24h hnu ah a bo ang</p>
          </div>
        </div>
      )}

      {/* View Status Modal */}
      {viewStatus && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getColor(viewStatus.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{getInitial(viewStatus.name)}</div>
              <div><p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '14px' }}>{viewStatus.name}</p><p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{formatTime(viewStatus.createdAt)}</p></div>
            </div>
            <button onClick={() => setViewStatus(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} color="#fff" /></button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0 80px 0' }}>
            {viewStatus.imageUrl && (<img src={viewStatus.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />)}
            {viewStatus.text && (<div style={{ position: 'absolute', bottom: '100px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '18px', fontWeight: '600' }}>{viewStatus.text}</div>)}
            {!viewStatus.imageUrl && viewStatus.text && (<div style={{ width: '100%', height: '100%', background: getColor(viewStatus.name), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#fff', fontSize: '28px', fontWeight: '800', textAlign: 'center' }}>{viewStatus.text}</div>)}
          </div>
          {viewStatus.userId === currentUid && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '12px 16px', maxHeight: '150px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Eye size={14} color="#fff" /><p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '700' }}>{viewStatus.viewers?.length || 0} views</p></div>
              {viewStatus.viewers?.map((v: any, i: number) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getColor(v.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{getInitial(v.name)}</div><p style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{v.name}</p></div>))}
              {(!viewStatus.viewers || viewStatus.viewers.length === 0) && (<p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>La en tu an awm lo</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
    }
