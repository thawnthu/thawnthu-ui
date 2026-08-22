import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export function setupPresence(uid: string) {
  if (!uid) return;

  const userRef = doc(db, "users", uid);

  const setOnline = async () => {
    await setDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
  };

  const setOffline = async () => {
    await setDoc(userRef, {
      online: false,
      lastSeen: serverTimestamp()
    }, { merge: true });
  };

  // App luh rual in online
  setOnline();

  // 30 sec dan ah update - phone a app a la awm tih hriat nan
  const interval = setInterval(setOnline, 30000);

  // Tab an thlak / app an minimize -> offline
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      setOnline();
    } else {
      setOffline();
    }
  };

  // Browser close / back / tab close -> offline
  const handleBeforeUnload = () => {
    // beacon a chak loh chuan firestore rest hmang a set offline
    // navigator.sendBeacon hmang lo in direct set (best effort)
    setOffline();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handleBeforeUnload);

  // cleanup
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('pagehide', handleBeforeUnload);
    setOffline();
  };
}
