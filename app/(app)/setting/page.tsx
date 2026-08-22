'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, ShieldBan, Save, Eye, EyeOff, Type } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';

export default function SettingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [showBlockList, setShowBlockList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setName(auth.currentUser?.displayName || '');
    setEmail(auth.currentUser?.email || '');
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    setFontSize(localStorage.getItem('fontSize') || '16');

    const unsubBlock = onSnapshot(collection(db, "users", uid, "blocked"), (snap) => {
      setBlockedUsers(snap.docs.map(d => ({ id: d.id,...d.data() })));
    });
    return () => unsubBlock();
  }, []);

  const applyAndSave = (isDark: boolean, fSize: string) => {
    setDarkMode(isDark); setFontSize(fSize);
    localStorage.setItem('darkMode', String(isDark));
    localStorage.setItem('fontSize', fSize);
    document.documentElement.style.fontSize = fSize + 'px';
    const uid = auth.currentUser?.uid;
    if (uid) setDoc(doc(db, "users", uid), { darkMode: isDark, fontSize: fSize }, { merge: true });
  };

  const handleDarkToggle = () => applyAndSave(!darkMode, fontSize);
  const handleFontChange = (size: string) => applyAndSave(darkMode, size);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await setDoc(doc(db, "users", auth.currentUser.uid), { name }, { merge: true });
        alert("Name updated!");
      }
    } catch (e:any){ alert(e.message); } setSaving(false);
  };
  const handleSaveEmail = async () => {
    if (!currentPass) return alert("Current password dah rawh");
    setSaving(true);
    try {
      const user = auth.currentUser!; const cred = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, cred);
      await updateEmail(user, email);
      await setDoc(doc(db, "users", user.uid), { email }, { merge: true });
      alert("Email updated!");
    } catch (e:any){ alert(e.message); } setSaving(false);
  };
  const handleChangePassword = async () => {
    if (newPass!== confirmPass) return alert("Password inmil lo");
    if (newPass.length < 6) return alert("6+ char");
    if (!currentPass) return alert("Current password dah rawh");
    setSaving(true);
    try {
      const user = auth.currentUser!; const cred = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);
      alert("Password changed!"); setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e:any){ alert(e.message); } setSaving(false);
  };
  const handleUnblock = async (id: string) => {
    const uid = auth.currentUser?.uid; if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "blocked", id));
    const snap = await getDoc(doc(db, "users", uid)); const data = snap.data() as any;
    if (data?.blocked) await updateDoc(doc(db, "users", uid), { blocked: data.blocked.filter((x:string)=>x!==id) });
  };

  const card = { background: darkMode? '#1a1a1c' : '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid ${darkMode? '#2a2a2c' : '#eee'}` };
  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${darkMode? '#333' : '#ddd'}`, background: darkMode? '#222' : '#f9f9f9', color: darkMode? '#fff' : '#000', outline: 'none', fontSize: '1rem' };

  return (
    <div style={{ background: darkMode? '#0f0f10' : '#f5f5f5', minHeight: '100vh', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', color: darkMode? '#fff' : '#000' }}>
      <div style={card}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18}/> Profile Settings</h3>
        <label style={{ fontSize: '0.85rem', opacity: 0.7 }}>Name</label>
        <div style={{ display: 'flex', gap: '8px', margin: '6px 0 12px 0' }}>
          <input value={name} onChange={e=>setName(e.target.value)} style={{...inputStyle, flex: 1 }} />
          <button onClick={handleSaveName} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 16px', cursor: 'pointer' }}><Save size={18}/></button>
        </div>
        <label style={{ fontSize: '0.85rem', opacity: 0.7 }}>Email</label>
        <div style={{ display: 'flex', gap: '8px', margin: '6px 0 12px 0' }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{...inputStyle, flex: 1 }} />
          <button onClick={handleSaveEmail} style={{ background: '#8d31ce', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 16px', cursor: 'pointer' }}><Save size={18}/></button>
        </div>
        <input type={showPass? "text" : "password"} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} style={inputStyle} placeholder="Current password (Email/Pass change atan)"/>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18}/> Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input type={showPass? "text" : "password"} value={newPass} onChange={e=>setNewPass(e.target.value)} style={inputStyle} placeholder="New password"/>
            <button onClick={()=>setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: darkMode? '#fff' : '#000' }}>{showPass? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
          <input type={showPass? "text" : "password"} value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} style={inputStyle} placeholder="Confirm new password"/>
          <button onClick={handleChangePassword} disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, cursor: 'pointer' }}>{saving? "Saving..." : "Update Password"}</button>
        </div>
      </div>

      <div style={{...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>{darkMode? <Moon size={20}/> : <Moon size={20}/>} Dark Mode</div>
        <button onClick={handleDarkToggle} style={{ width: '52px', height: '30px', borderRadius: '20px', border: 'none', background: darkMode? '#8d31ce' : '#ddd', position: 'relative', cursor: 'pointer' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: darkMode? '25px' : '3px', transition: '0.2s' }}/>
        </button>
      </div>

      {/* FONT SIZE CONTROL - SITE PUMPUI */}
      <div style={card}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Type size={18}/> Font Size - Site pumpui</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Small', val: '14' },
            { label: 'Default', val: '16' },
            { label: 'Large', val: '18' },
            { label: 'XL', val: '20' },
          ].map(f => (
            <button key={f.val} onClick={()=>handleFontChange(f.val)} style={{
              padding: '8px 16px', borderRadius: '20px', border: fontSize===f.val? '2px solid #8d31ce' : `1px solid ${darkMode? '#333' : '#ddd'}`,
              background: fontSize===f.val? '#e9e5ff' : darkMode? '#222' : '#f9f9f9',
              color: fontSize===f.val? '#8d31ce' : darkMode? '#fff' : '#000',
              fontWeight: 700, cursor: 'pointer', fontSize: f.val+'px'
            }}>{f.label} ({f.val})</button>
          ))}
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '8px' }}>He font size hi page tin ah a lang nghal vek ang.</p>
      </div>

      <div style={card}>
        <button onClick={()=>setShowBlockList(!showBlockList)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: darkMode? '#fff' : '#000', fontSize: '1rem', fontWeight: 800 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldBan size={18}/> Block ({blockedUsers.length})</span>
          <span>{showBlockList? '−' : '+'}</span>
        </button>
        {showBlockList && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blockedUsers.length === 0? <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>No blocked users</p>
            : blockedUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: darkMode? '#222' : '#f9f9f9', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8d31ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{u.name?.charAt(0) || '?'}</div>
                  <span style={{ fontWeight: 600 }}>{u.name || u.id}</span>
                </div>
                <button onClick={()=>handleUnblock(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Unblock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
