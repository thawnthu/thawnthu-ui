'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfileIndex() {
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) router.replace(`/profile/${u.uid}`);
      else router.replace('/login');
    });
    return () => unsub();
  }, [router]);
  return null;
}
