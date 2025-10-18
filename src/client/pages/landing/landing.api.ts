import { emailSignIn, emailSignUp, getCurrentUserInfo, getIdToken, googleSignIn, hasGmailAccess, setGmailConsentGranted } from "@/client/global-services/auth";
import type { NavigateFunction } from "react-router";
import { api } from "@/client/global-services/api";

// Return shape used components: [ok, message?]
type ApiResponse = [boolean, string?];

// This will get housed in the connect to gmail function later
// Checks if the gmail parser is connected, if not redirects to consent screen
// gains consent and updates the db accordingly
async function connectGmailAPI() 
{
  try
  {
    // check first if google user already has access if so skip consent flow
    const userInfo = getCurrentUserInfo();

    if (userInfo?.isGoogleUser) 
    {
      console.log("User is Google user and already has Gmail access.");
      return;
    }

     // check first if user already has gmail access
    if (hasGmailAccess()) 
    {
      console.log("User already has Gmail access.");
      return;
    }

    const response = await api("/api/auth/gmail-consent-status");

    if (response.isConnected) 
    {
      console.log("Gmail consent status: Established");

      setGmailConsentGranted();
      return;
    } 
    
    console.log("Gmail consent status: Not established");
    const token = await getIdToken()
    window.location.href = `http://localhost:8000/api/auth/consent?token=${token}`;
  } catch (error) {
    console.error("Error checking Gmail consent status:", error);
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
    connectGmailAPI();
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
    connectGmailAPI();
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

      console.log("Google sign-in completed - Gmail access already granted through popup");
      return [true, "Google log in successful"];
    } else {
      // Placeholder for Outlook sign-in method
      return [false, "Outlook sign in not implemented"];
    }
  } catch (error: any) {
    return [false, error?.message ?? `${provider} log in failed`];
  } 
}