import { initializeApp, getApps } from "firebase/app";
const firebaseConfig = { apiKey: "TEST", projectId: "TEST" };
const app =!getApps().length? initializeApp(firebaseConfig) : getApps()[0];
export default app;
