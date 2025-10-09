import { auth, googleProvider } from "./firebase";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";

// Observe auth state changes
export function observeUser(callback: (user: User | null) => void) {
    const unsubscribe = onAuthStateChanged(auth, (user) => callback(user));
    return unsubscribe;
}

// Sign up a new user with email and password
export async function emailSignUp(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// Sign in an existing user with email and password
export async function emailSignIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// Sign in with Google popup
export async function googleSignIn() {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
}

// ------- TODO: Add Outlook sign-in method ----------

// Sign out the current user
export async function logOut() {
    await signOut(auth);
}

// Get a 'fresh' ID token for the current user
export async function getIdToken(forceRefresh = false) {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
}