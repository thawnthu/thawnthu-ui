'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Moon, ShieldBan, X, Edit3, ChevronRight, Type, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';

function SmallAlert({ open, title, msg, onClose, dark }: any) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '320px', background: dark? '#1e1e1e' : '#fff', borderRadius: '18px', padding: '18px', textAlign: 'center', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 6px 0', fontWeight: 800 }}>{title}</h3>
        <p style={{ margin: '0 0 14px 0', color: '#888', fontSize: '0.9rem' }}>{msg}</p>
        <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: '#8d31ce', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>OK</button>
      </div>
    </div>
  );
}

export default function SettingPage() {
  const [name, setName] = useState(''); const [newName, setNewName] = useState('');
  const [email, setEmail] = useState(''); const [newEmail, setNewEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false); const [fontSize, setFontSize] = useState('16');
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]); const [showBlockList, setShowBlockList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPass, setCurrentPass] = useState(''); const [newPass, setNewPass] = useState(''); const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false); const [showNew, setShowNew] = useState(false); const [showConfirm, setShowConfirm] = useState(false);
  const [modal, setModal] = useState<'name' | 'email' | 'password' | null>(null);
  const [alert, setAlert] = useState<{ open: boolean, title: string, msg: string }>({ open: false, title: '', msg: '' });

  useEffect(() => {
    const uid = auth.currentUser?.uid; if (!uid) return;
    setName(auth.currentUser?.displayName || ''); setNewName(auth.currentUser?.displayName || '');
    setEmail(auth.currentUser?.email || ''); setNewEmail(auth.currentUser?.email || '');
    setDarkMode(localStorage.getItem('darkMode') === 'true'); setFontSize(localStorage.getItem('fontSize') || '16');
    const unsubBlock = onSnapshot(collection(db, "users", uid, "blocked"), (snap) => { setBlockedUsers(snap.docs.map(d => ({ id: d.id,...d.data() }))); });
    return () => unsubBlock();
  }, []);

  const showAlert = (title: string, msg: string) => setAlert({ open: true, title, msg });
  const applyAndSave = (isDark: boolean, fSize: string) => {
    setDarkMode(isDark); setFontSize(fSize); localStorage.setItem('darkMode', String(isDark)); localStorage.setItem('fontSize', fSize);
    document.documentElement.style.fontSize = fSize + 'px'; const uid = auth.currentUser?.uid;
    if (uid) setDoc(doc(db, "users", uid), { darkMode: isDark, fontSize: fSize }, { merge: true });
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return showAlert("Error", "Name empty");
    setSaving(true);
    try {
      if (auth.currentUser) { await updateProfile(auth.currentUser, { displayName: newName }); await setDoc(doc(db, "users", auth.currentUser.uid), { name: newName }, { merge: true }); setName(newName); setModal(null); showAlert("Success", "Name updated!"); }
    } catch (e:any){ showAlert("Error", e.message); } setSaving(false);
  };
  const handleSaveEmail = async () => {
    if (!currentPass) return showAlert("Error", "Current password dah rawh");
    setSaving(true);
    try {
      const user = auth.currentUser!; const cred = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, cred); await updateEmail(user, newEmail);
      await setDoc(doc(db, "users", user.uid), { email: newEmail }, { merge: true }); setEmail(newEmail); setModal(null); setCurrentPass(''); showAlert("Success", "Email updated!");
    } catch (e:any){ showAlert("Error", e.message); } setSaving(false);
  };
  const handleChangePassword = async () => {
    if (newPass!== confirmPass) return showAlert("Error", "Password inmil lo");
    if (newPass.length < 6) return showAlert("Error", "6+ char ni rawh se");
    if (!currentPass) return showAlert("Error", "Current password dah rawh");
    setSaving(true);
    try {
      const user = auth.currentUser!; const cred = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, cred); await updatePassword(user, newPass);
      setModal(null); setCurrentPass(''); setNewPass(''); setConfirmPass(''); showAlert("Success", "Password changed!");
    } catch (e:any){ showAlert("Error", e.message); } setSaving(false);
  };
  const handleUnblock = async (id: string) => {
    const uid = auth.currentUser?.uid; if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "blocked", id));
    const snap = await getDoc(doc(db, "users", uid)); const data = snap.data() as any;
    if (data?.blocked) await updateDoc(doc(db, "users", uid), { blocked: data.blocked.filter((x:string)=>x!==id) });
    showAlert("Unblocked", "User unblocked");
  };

  const card = { background: darkMode? '#1a1a1c' : '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${darkMode? '#2a2a2c' : '#eee'}` };
  const inputWrap = { position: 'relative' as const, width: '100%' };
  const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', borderRadius: '12px', border: `1px solid ${darkMode? '#333' : '#ddd'}`, background: darkMode? '#222' : '#f9f9f9', color: darkMode? '#fff' : '#000', outline: 'none', fontSize: '0.95rem' };
  const inputWithEye = { ...inputStyle, paddingRight: '42px' };
  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 4px', cursor: 'pointer' };
  const eyeBtn = { position: 'absolute' as const, right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' };

  return (
    <div style={{ background: darkMode? '#0f0f10' : '#f5f5f5', minHeight: '100vh', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', color: darkMode? '#fff' : '#000' }}>
      <div style={card}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20}/> Profile Settings</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: '0 0 8px 28px' }}>{name} • {email}</p>
        <div style={{ marginTop: '8px' }}>
          <div onClick={()=>{setNewName(name); setModal('name')}} style={rowStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={20} color="#6366f1"/></div><div><div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Change Name</div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{name}</div></div></div><ChevronRight size={20} color="#aaa"/></div>
          <div style={{ height: '1px', background: darkMode? '#2a2a2c' : '#f0f0f0', marginLeft: '54px' }}></div>
          <div onClick={()=>{setNewEmail(email); setModal('email')}} style={rowStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} color="#f59e0b"/></div><div><div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Change Email</div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{email}</div></div></div><ChevronRight size={20} color="#aaa"/></div>
          <div style={{ height: '1px', background: darkMode? '#2a2a2c' : '#f0f0f0', marginLeft: '54px' }}></div>
          <div onClick={()=>setModal('password')} style={rowStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} color="#ef4444"/></div><div><div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Change Password</div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>••••••••</div></div></div><ChevronRight size={20} color="#aaa"/></div>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={()=>setModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '360px', background: darkMode? '#1e1e1e' : '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{modal==='name'? 'Change Name' : modal==='email'? 'Change Email' : 'Change Password'}</h3>
              <button onClick={()=>setModal(null)} style={{ background: darkMode? '#2a2a2c' : '#f0f0f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
            </div>
            {modal==='name' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><div style={inputWrap}><input value={newName} onChange={e=>setNewName(e.target.value)} style={inputStyle} placeholder="New name"/></div><div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}><button onClick={()=>setModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${darkMode? '#333' : '#ddd'}`, background: 'none', color: darkMode? '#fff' : '#000', fontWeight: 700, cursor: 'pointer' }}>Cancel</button><button onClick={handleSaveName} disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving? '...' : 'Change Name'}</button></div></div>)}
            {modal==='email' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><div style={inputWrap}><input value={newEmail} onChange={e=>setNewEmail(e.target.value)} style={inputStyle} placeholder="New email"/></div><div style={inputWrap}><input type={showCurrent? "text" : "password"} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} style={inputWithEye} placeholder="Current password"/><button onClick={()=>setShowCurrent(!showCurrent)} style={eyeBtn}>{showCurrent? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}><button onClick={()=>setModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${darkMode? '#333' : '#ddd'}`, background: 'none', color: darkMode? '#fff' : '#000', fontWeight: 700, cursor: 'pointer' }}>Cancel</button><button onClick={handleSaveEmail} disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving? '...' : 'Change Email'}</button></div></div>)}
            {modal==='password' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><div style={inputWrap}><input type={showCurrent? "text" : "password"} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} style={inputWithEye} placeholder="Current password"/><button onClick={()=>setShowCurrent(!showCurrent)} style={eyeBtn}>{showCurrent? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div style={inputWrap}><input type={showNew? "text" : "password"} value={newPass} onChange={e=>setNewPass(e.target.value)} style={inputWithEye} placeholder="New password"/><button onClick={()=>setShowNew(!showNew)} style={eyeBtn}>{showNew? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div style={inputWrap}><input type={showConfirm? "text" : "password"} value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} style={inputWithEye} placeholder="Confirm password"/><button onClick={()=>setShowConfirm(!showConfirm)} style={eyeBtn}>{showConfirm? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}><button onClick={()=>setModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${darkMode? '#333' : '#ddd'}`, background: 'none', color: darkMode? '#fff' : '#000', fontWeight: 700, cursor: 'pointer' }}>Cancel</button><button onClick={handleChangePassword} disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving? '...' : 'Change Password'}</button></div></div>)}
          </div>
        </div>
      )}

      <SmallAlert open={alert.open} title={alert.title} msg={alert.msg} dark={darkMode} onClose={()=>setAlert({ ...alert, open: false })}/>

      <div style={{...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}><Moon size={20}/> Dark Mode</div><button onClick={()=>applyAndSave(!darkMode, fontSize)} style={{ width: '52px', height: '30px', borderRadius: '20px', border: 'none', background: darkMode? '#8d31ce' : '#ddd', position: 'relative', cursor: 'pointer' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: darkMode? '25px' : '3px', transition: '0.2s' }}/></button></div>
      <div style={card}><h3 style={{ margin: '0 0 12px 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Type size={18}/> Font Size</h3><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{[{l:'Small',v:'14'},{l:'Default',v:'16'},{l:'Large',v:'18'},{l:'XL',v:'20'}].map(f=>(<button key={f.v} onClick={()=>applyAndSave(darkMode,f.v)} style={{ padding: '8px 16px', borderRadius: '20px', border: fontSize===f.v? '2px solid #8d31ce' : `1px solid ${darkMode? '#333' : '#ddd'}`, background: fontSize===f.v? '#e9e5ff' : darkMode? '#222' : '#f9f9f9', color: fontSize===f.v? '#8d31ce' : darkMode? '#fff' : '#000', fontWeight: 700, cursor: 'pointer', fontSize: f.v+'px' }}>{f.l}</button>))}</div></div>
      <div style={card}><button onClick={()=>setShowBlockList(!showBlockList)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: darkMode? '#fff' : '#000', fontSize: '1rem', fontWeight: 800 }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldBan size={18}/> Block ({blockedUsers.length})</span><span>{showBlockList? '−' : '+'}</span></button>{showBlockList && (<div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{blockedUsers.length===0? <p style={{ textAlign: 'center', color: '#888' }}>No blocked users</p> : blockedUsers.map(u=>(<div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: darkMode? '#222' : '#f9f9f9', borderRadius: '10px' }}><span style={{ fontWeight: 600 }}>{u.name || u.id}</span><button onClick={()=>handleUnblock(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Unblock</button></div>))}</div>)}</div>
    </div>
  );
}
