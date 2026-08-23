'use client';
import { Trash2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type Props = {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'delete' | 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CustomConfirm({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = true,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  const config = {
    delete: { icon: <Trash2 size={26} color="#ef4444" />, bg: '#fee2e2', btn: '#ef4444' },
    success: { icon: <CheckCircle size={26} color="#22c55e" />, bg: '#dcfce7', btn: '#8d31ce' },
    warning: { icon: <AlertTriangle size={26} color="#f59e0b" />, bg: '#fef3c7', btn: '#f59e0b' },
    info: { icon: <Info size={26} color="#8d31ce" />, bg: '#f3e8ff', btn: '#8d31ce' },
  }[type];

  const finalTitle = title || (type==='delete'? 'Delete?' : type==='success'? 'Success!' : type==='warning'? 'Warning' : 'Alert');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: '#fff', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
          {config.icon}
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontWeight: '800', fontSize: '18px', color: '#000' }}>{finalTitle}</h3>
        <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', lineHeight: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {showCancel && (
            <button onClick={onCancel} style={{ flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid #e5e7eb', background: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              {cancelText}
            </button>
          )}
          <button onClick={onConfirm} style={{ flex: 1, padding: '13px', borderRadius: '14px', border: 'none', background: config.btn, color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
