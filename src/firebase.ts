import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if credentials are set to prevent early/uninformative crashes
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. Please configure VITE_FIREBASE_API_KEY in your secrets/environment.");
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore using the databaseId from environment or default applet ID
const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-bc7487d5-0c85-4009-83f7-44d0efcb9489";
export const db = initializeFirestore(app, {}, databaseId);
export const auth = getAuth(app);

