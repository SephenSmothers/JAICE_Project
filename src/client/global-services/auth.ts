import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

export const signUp = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

// Observe auth state changes
export const observeUser = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

// Get ID token for backend calls
export const getIdToken = async () => auth.currentUser?.getIdToken();

// Wait for initial auth state resolution
export function waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}