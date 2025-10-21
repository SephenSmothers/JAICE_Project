// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./account-components/"
// import public from "/asset-filename.ext"
import { auth} from "../../../global-services/firebase";
import Button from "@/client/global-components/button";
import { deleteCurrentUser } from "@/client/global-services/auth";
import { useEffect, useState } from "react";
import { api } from "@/client/global-services/api";
import { setGmailConsentGranted } from "@/client/global-services/auth";
import { googleSignIn } from "@/client/global-services/auth";
// gains consent and updates the db accordingly
async function connectGmailAPI() 
{
  try
  {
    console.log("Starting Gmail connection check...");
    
    // first check if already connected
    console.log("Checking server-side Gmail consent status...");
    const response = await api("/api/auth/gmail-consent-status");
    console.log("Server response:", response);

    if (response.isConnected) 
    {
      setGmailConsentGranted();

      try 
      {
        const testResponse = await api("/gmail/messages?maxResults=1");
        console.log("Gmail API test successful:", testResponse);

        return { success: true, message: "Gmail already connected and working" };

      } catch (testError) {
        console.error("Gmail consent granted but API call failed:", testError);
        return { success: false, message: "Gmail consent granted but unable to read emails" };
      }
    } 
    else 
    {
      // use pop up flow
      console.log("Gmail not connected, starting popup OAuth flow...");
      
      try {
        await googleSignIn();
        await api("/api/auth/setup-rls-session", { method: 'POST' });
        
        console.log("Popup OAuth completed, Gmail should now be connected");
        return { success: true, message: "Gmail connected successfully via popup" };
        
      } catch (oauthError) {
        console.error("Popup OAuth failed:", oauthError);
        return { success: false, message: `OAuth popup failed: ${oauthError}` };
      }
    }

  } catch (error) {
    console.error("Error in connectGmailAPI:", error);
    return { success: false, message: `Error connecting to Gmail: ${error}` };
  }
}

export function AccountPage() 
{
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailBusy, setGmailBusy] = useState(false);

  // check if gmail is already connected
  useEffect(() => {
    checkGmailStatus();
  }, []);


  async function checkGmailStatus() 
  {
    try 
    {
      const testResult = await api("/gmail/messages?maxResults=1");
        
      // If we can fetch emails, Gmail is connected
      if (testResult && testResult.messages) 
      {
        setGmailConnected(true);
        setError(null);
        console.log("Gmail is properly connected - can fetch emails");
      } else {
        setGmailConnected(false);
        setError(null);
        console.log("Gmail API response invalid");
      }

    } catch (testError) {
      console.error("Gmail API test failed:", testError);
      setGmailConnected(false);
        
      // check if its an auth error vs other error
      if (testError && testError.toString().includes('401')) 
      {
        setError("Gmail not connected - authentication required");
      } else {
        setError("Gmail connection test failed");
      }
    }
  }

  async function handleGmailConnection() 
  {
    setGmailBusy(true);
    setError(null);

    const result = await connectGmailAPI();
    console.log("Gmail connection result:", result);

    if (result.success) 
    {
      console.log("Gmail connection successful:", result.message);
      setError(null);
      
      // refresh status to double check
      setTimeout(() => {
        checkGmailStatus();
      }, 1000);
      
    } else {
      console.error("Gmail connection failed:", result.message);
      setError(result.message);
      setGmailConnected(false);
    }
    setGmailBusy(false);
  }

  async function handleDelete() {
    setError(null);
    const sure = window.confirm(
      "This will permanently delete your account. This cannot be undone. Continue?"
    );
    if (!sure) return;

    setBusy(true);
    const res = await deleteCurrentUser(); // if you support email/password reauth, pass { email, password } here
    setBusy(false);

    if (res.ok) {
      // Account deleted; user will be signed out. Send them to your Landing page.
      window.location.assign("/");
      return;
    }

    if (res.code === "reauth-needed" || res.code === "auth/requires-recent-login") {
      setError("Please re-authenticate and try again.");
      // If you support email/password, collect the current password and retry:
       const email = auth.currentUser?.email?.toString();
       const password = prompt("Confirm your current password to continue:") || "";
       if (password) {
         setBusy(true);
         const retry = await deleteCurrentUser({ email, password });
         setBusy(false);
         if (retry.ok) { window.location.assign("/"); return; }
         setError(`Failed to delete account: ${retry.code}`);
       }
      return;
    }

    setError(`Failed to delete account: ${res.code}`);
  }

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100"
      style={{background: "var(--color-bg)"}}>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left heading */}
          <div className="md:col-span-3">
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug">
              Account
              <br className="hidden md:block" /> Settings
            </h1>
          </div>

          {/* Right panel */}
          <div className="md:col-span-9 -mr-6 pl-4"
            style={{
              width: "calc(100vw - 70rem)",
              marginLeft: "auto"
            }}>
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug text-left">
              Profile Info
            </h1>
            <hr className="w-full border-t-2 border-gray-400 my-2" />
            
            {/* profile picture */}
            <div className="flex items-center gap-6 my-6">

              {/* picture placeholder */}
              <div  className="w-24 h-24 rounded-full bg-gray-600"></div>

              {/* upload/remove button */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button onClick={() => console.log("Change Photo clicked")}>
                    Change Photo 
                  </Button>

                  <Button onClick={() => console.log("Remove Photo clicked")}>
                    Remove Photo
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  We support PNGs, JPGs, and GIFs under 2MB.
                </p>
                </div>
              </div>

            {/* name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  First Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Last Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/*  phone number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Phone Number
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number xxx-xxx-xxxx"
                />
              </div>
            </div>

             <h1 className="text-2xl md:text-3xl font-semibold leading-snug text-left">
              Account Security
            </h1>
            <hr className="w-full border-t-2 border-gray-400 my-2" />

            {/* email */}
             <div className="my-6 text-left">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Gmail Integration
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Connect your Gmail account to allow email parsing and analysis.
              </p>
              <Button 
                onClick={gmailBusy || gmailConnected ? undefined : handleGmailConnection}
              >
                {gmailBusy ? "Connecting..." : gmailConnected ? "Connected" : "Connect Gmail"}
              </Button>
              {error && (
                <p className="mt-2 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div> 
         

            {/* password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Password
                </label>
                <div className="flex gap-6 items-end">
                  <input 
                    type="password" 
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                  <Button onClick={() => console.log("Change Password clicked")}>
                    Change Password
                  </Button>
                </div>
              </div>
            </div>

            {/* two-factor authentication */}
            <div className="my-6 text-left">
              <div className="flex justify-start gap-10 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-400">
                    Add an additional layer of security to your account during login.
                  </p>
                </div>
                <div className="flex items-center">
                  <label className ="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      onChange={() => console.log("2FA toggled")}
                    />
                    <div className="w-11 h-6 bg-gray-600 
                    rounded-full peer peer-focus:ring-blue-300 peer-checked:bg-blue-600 
                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 
                    after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full">
                    </div>
                  </label>
                </div>
              </div>
            </div>

                 {/* delete account */}
            <div className="my-6 text-left">
              <button
                onClick={handleDelete}
                disabled={busy}
                aria-busy={busy}
                className="red"
              >
                {busy ? "Deleting..." : "Delete Account"}
              </button>
              {error && (
                <p className="mt-2 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
