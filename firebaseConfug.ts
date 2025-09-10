import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREABSE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREABSE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREABSE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREABSE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREABSE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREABSE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREABSE_MEASUREMENT_ID
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_FIRESTORE = getFirestore(FIREBASE_APP);