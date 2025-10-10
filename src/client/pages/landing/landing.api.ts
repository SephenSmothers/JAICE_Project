import { emailSignIn, emailSignUp, googleSignIn } from "@/client/global-services/auth";
import type { NavigateFunction } from "react-router";

// Return shape used components: [ok, message?]
type ApiResponse = [boolean, string?];

/*
* Create New Account Function
* Simulates an API call to create a new user account, we need to hook this into our backend.
*/
export async function CreateNewAccount({email, password}: {email: string, password: string}) {
  // takes the email and password, and creates a new account.
  try {
    await emailSignUp(email, password);
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
      return [true, "Google log in successful"];
    } else {
      // Placeholder for Outlook sign-in method
      return [false, "Outlook sign in not implemented"];
    }
  } catch (error: any) {
      return [false, error?.message ?? `${provider} log in failed`];
    } 
}