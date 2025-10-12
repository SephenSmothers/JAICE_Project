import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
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

/**
 * Delete the currently signed-in user.
 * - If recent login is required and the provider is Google, it will try a quick reauth popup automatically.
 * - Returns { ok: true } on success, or { ok: false, code } on failure so the UI can react.
 */
export async function deleteCurrentUser(opts?: { email?: string; password?: string }) {
  const user = auth.currentUser;
  if (!user) return { ok: false as const, code: "no-user" as const };

  try {
    await deleteUser(user);
    return { ok: true as const };
  } catch (err: any) {
    if (err?.code !== "auth/requires-recent-login") {
      return { ok: false as const, code: err?.code ?? "unknown" };
    }

    // Requires recent login — try to reauthenticate based on provider
    const providerIds = user.providerData.map((p) => p.providerId);

    try {
      if (providerIds.includes("google.com")) {
        // Reauth with Google popup
        await reauthenticateWithPopup(user, googleProvider);
      } else if (providerIds.includes("password")) {
        // Need email & current password for email/password reauth
        if (!opts?.email || !opts?.password) {
          return { ok: false as const, code: "reauth-needed" as const };
        }
        const cred = EmailAuthProvider.credential(opts.email, opts.password);
        await reauthenticateWithCredential(user, cred);
      } else {
        // Other providers: instruct UI to trigger a reauth flow
        return { ok: false as const, code: "reauth-needed" as const };
      }

      // After successful reauth, try delete again
      await deleteUser(user);
      return { ok: true as const };
    } catch (reauthErr: any) {
      return { ok: false as const, code: reauthErr?.code ?? "reauth-failed" as const };
    }
  }
}