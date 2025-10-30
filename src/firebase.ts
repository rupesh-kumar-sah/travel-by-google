import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "travel-app-demo",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "travel-app-demo.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcd1234",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;

// Initialize demo data in Firestore when running locally without real API keys
if (process.env.FIREBASE_PROJECT_ID === "travel-app-demo") {
  initializeDemoData();
}

async function initializeDemoData() {
  // This will be called to set up initial demo posts
}
