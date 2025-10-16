
import 
{
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,

} from "firebase/auth";

import type { User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Observe auth state changes
export function observeUser(callback: (user: User | null) => void) 
{
    const unsubscribe = onAuthStateChanged(auth, (user) => callback(user));
    return unsubscribe;
}

// Sign up a new user with email and password
export async function emailSignUp(email: string, password: string) 
{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // clear any existing google tokens
    localStorage.removeItem('google_access_token');

    return userCredential.user;
}

// Sign in an existing user with email and password
export async function emailSignIn(email: string, password: string) 
{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // clear any existing google tokens
    localStorage.removeItem('google_access_token');

    return userCredential.user;
}

// Sign in with Google popup
export async function googleSignIn() 
{
  try 
  {
      const userCredential = await signInWithPopup(auth, googleProvider);

      // get the Google OAuth access token
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      const accessToken = credential?.accessToken;

      if (accessToken) 
      {
          // store token for gmail API calls
          localStorage.setItem('google_access_token', accessToken);
          console.log('Google access token stored in localStorage.');
      } else {
          console.warn('No access token found in Google sign-in result.');
      }

      return userCredential.user;
  } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
  }
}

// ------- TODO: Add Outlook sign-in method ----------

// Sign out the current user
export async function logOut() 
{
    // clear any existing google tokens
    localStorage.removeItem('google_access_token');

    await signOut(auth);
}

// Get a 'fresh' ID token for the current user
export async function getIdToken(forceRefresh = false) 
{
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
}

// get google OAuth token
export function getGoogleAccessToken(): string | null
{
    return localStorage.getItem('google_access_token');
}

// check if current user has gmail access
export function hasGmailAccess(): boolean
{
    const user = auth.currentUser;
    if (!user) return false;

    // check if user signed in with google and has access token
    const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
    const hasToken = !!getGoogleAccessToken();

    return isGoogleUser && hasToken;
}


// get user info including gmail access status
export function getCurrentUserInfo()
{
    const user = auth.currentUser;
    if (!user) return null;

    const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
    const userHasGmailAccess = hasGmailAccess();

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isGoogleUser,
        hasGmailAccess: userHasGmailAccess,
        providers: user.providerData.map(p => p.providerId)
    };
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