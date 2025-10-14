import { emailSignIn, emailSignUp, getIdToken, googleSignIn } from "@/client/global-services/auth";
import type { NavigateFunction } from "react-router";
import { api } from "@/client/global-services/api";
// Return shape used components: [ok, message?]
type ApiResponse = [boolean, string?];

// This will get housed in the connect to gmail function later
// Checks if the gmail parser is connected, if not redirects to consent screen
// gains consent and updates the db accordingly
async function connectGmailEmailAPIIfNeeded() {
  // we could use this swait status to display if users need to link email
  const response = await api("/api/auth/status");
  if (response.status == "Connected") {
    console.log("Gmail parser status: Established");
  } else {
    console.log("Gmail parser status: Not established");
    const token = await getIdToken()
    window.location.href = `http://localhost:8000/api/auth/consent?token=${token}`;
  }
}

/*
* Create New Account Function
* Simulates an API call to create a new user account, we need to hook this into our backend.
*/
export async function CreateNewAccount({email, password}: {email: string, password: string}) {
  // takes the email and password, and creates a new account.
  try {
    await emailSignUp(email, password);
    await api("/api/auth/setup-rls-session", { method: "POST" });
    connectGmailEmailAPIIfNeeded();
    return [true, "Account created successfully"];
  } catch (error: any) {
    return [false, error?.message ?? "Account creation failed"];
  }
}

export async function LogUserIn({
  navigate,
  email,
  password,
}: {
  navigate: NavigateFunction;// (path: string) => void;
  email: string;
  password: string;
}): Promise<ApiResponse> {
  try {
    await emailSignIn(email, password);
    await api("/api/auth/setup-rls-session", { method: 'POST' });
    connectGmailEmailAPIIfNeeded();
    navigate("/home");
    return [true, "Login successful"];
  } catch (error: any) {
    return [false, error?.message ?? "Login failed"];
  }
}

// Simulated Third-Party Log In Function
// This function simulates logging in with a third-party provider like Google or Outlook.
export async function thirdPartyLogIn(provider: "Google" | "Outlook"): Promise<ApiResponse> {
  try {
    if (provider === "Google") {
      await googleSignIn();
      await api("/api/auth/setup-rls-session", { method: 'POST' });
      connectGmailEmailAPIIfNeeded();
      return [true, "Google log in successful"];
    } else {
      // Placeholder for Outlook sign-in method
      return [false, "Outlook sign in not implemented"];
    }
  } catch (error: any) {
    return [false, error?.message ?? `${provider} log in failed`];
  } 
}