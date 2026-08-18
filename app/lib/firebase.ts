import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {apiKey: "AIzaSyCYP1ilO17KsJIcw0mP0s6_EYZ8JWmIQXU",authDomain: "thawnthu-e3b68.firebaseapp.com",projectId: "thawnthu-e3b68",storageBucket: "thawnthu-e3b68.firebasestorage.app",messagingSenderId: "580550703112",appId: "1:580550703112:web:9a67fc09b9150aa20ff9bd",measurementId: "G-BKJ5917LFY"};
const app = getApps().length === 0? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
