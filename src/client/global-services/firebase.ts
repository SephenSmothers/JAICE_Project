import { initializeApp, getApps } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase once
const app = getApps.length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase Authentication and set persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Export the initialized app and auth instances
export { app, auth };