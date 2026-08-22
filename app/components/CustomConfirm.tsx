'use client';
import { X } from 'lucide-react';

export function ConfirmModal({ open, title, message, onCancel, onConfirm, confirmText="Delete", dark=false }: any) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: dark? '#1e1e1e' : '#fff', borderRadius: '20px', padding: '20px', boxSizing: 'border-box', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: '1.1rem', color: dark? '#fff' : '#000' }}>{title}</h3>
        <p style={{ margin: '0 0 18px 0', color: '#888', fontSize: '0.9rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${dark? '#333' : '#ddd'}`, background: 'none', color: dark? '#fff' : '#000', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ open, title, message, onClose, dark=false }: any) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: dark? '#1e1e1e' : '#fff', borderRadius: '20px', padding: '20px', boxSizing: 'border-box', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: '1.1rem', color: dark? '#fff' : '#000' }}>{title}</h3>
        <p style={{ margin: '0 0 18px 0', color: '#888', fontSize: '0.9rem' }}>{message}</p>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#8d31ce', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>OK</button>
      </div>
    </div>
  );
}
