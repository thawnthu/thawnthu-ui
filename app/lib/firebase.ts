import { initializeApp, getApps } from "firebase/app";
const firebaseConfig = { apiKey: "AIzaSyCYP1iIoI7KsJIcw0mP0s6_EYZ8JWmIQXU", projectId: "thawnthu-e3b68" };
const app =!getApps().length? initializeApp(firebaseConfig) : getApps()[0];
export default app;
