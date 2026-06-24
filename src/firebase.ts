import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwiLwbm-wlYXOrIgCgpDfWV6jIiqrJ1WQ",
  authDomain: "astute-pottery-nhh41.firebaseapp.com",
  projectId: "astute-pottery-nhh41",
  storageBucket: "astute-pottery-nhh41.firebasestorage.app",
  messagingSenderId: "837281582239",
  appId: "1:837281582239:web:6a94a343adb778470966aa"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore using the databaseId from firebase-applet-config.json
export const db = initializeFirestore(app, {}, "ai-studio-bc7487d5-0c85-4009-83f7-44d0efcb9489");
