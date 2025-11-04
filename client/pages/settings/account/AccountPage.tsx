// import { localfiles } from "@/directory/path/to/localimport";

import { auth } from "@/global-services/firebase";
import Button from "@/global-components/button";
import { deleteCurrentUser, getIdToken } from "@/global-services/auth";
import { useEffect, useState } from "react";
import { api } from "@/global-services/api";
import userIcon from "@/assets/icons/user.svg";
import { FloatingInputField } from "@/global-components/FloatingInputField";

export function AccountPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailBusy, setGmailBusy] = useState(false);

  useEffect(() => {
    checkGmailStatus();
  }, []);

  async function checkGmailStatus() {
    try {
      const response = await api("/api/auth/gmail-consent-status");
      console.log("Gmail consent status response:", response);
      setGmailConnected(response.isConnected);
      setError(null);
      return;
    } catch (err) {
      console.error("Error checking Gmail consent status:", err);
      setGmailConnected(false);
      setError("Error checking gmail status.");
    }
  }

  async function handleGmailButtonClick() {
    if (gmailBusy) return; // Prevent multiple clicks
    setGmailBusy(true);

    try {
      if (gmailConnected) {
        console.log("Unlinking Gmail...");
        const res = await unlinkGmail();
        if (res.status === "success") {
          setGmailConnected(false);
        }
      } else {
        console.log("Linking Gmail...");
        const res = await linkGmail();
        if (res.status === "success") {
          setGmailConnected(true);
        }
      }
      setError(null);
    } catch (error) {
      console.error("Gmail link/unlink error:", error);
      setError("Error processing Gmail link.");
    } finally {
      setGmailBusy(false);
    }
  }

  async function linkGmail() {
    const res = await api("/api/auth/setup-rls-session", { method: "POST" });
    const token = await getIdToken();
    window.location.href = `http://localhost:8000/api/auth/consent?token=${token}`;
    return res;
  }

  async function unlinkGmail() {
    return await api("/api/auth/revoke-gmail-consent", { method: "POST" });
  }

  const gmailButtonText = gmailBusy
    ? "Processing..."
    : gmailConnected
    ? "Unlink Gmail"
    : "Link Gmail";

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

    if (
      res.code === "reauth-needed" ||
      res.code === "auth/requires-recent-login"
    ) {
      setError("Please re-authenticate and try again.");
      // If you support email/password, collect the current password and retry:
      const email = auth.currentUser?.email?.toString();
      const password =
        prompt("Confirm your current password to continue:") || "";
      if (password) {
        setBusy(true);
        const retry = await deleteCurrentUser({ email, password });
        setBusy(false);
        if (retry.ok) {
          window.location.assign("/");
          return;
        }
        setError(`Failed to delete account: ${retry.code}`);
      }
      return;
    }

    setError(`Failed to delete account: ${res.code}`);
  }

  return (
    <div
      className="w-full h-full bg-slate-950 text-slate-100"
      style={{ background: "var(--color-bg)" }}
    >
      <main className="flex flex-col md:flex-row w-full h-full justify-center">
        {/* Left/Top Heading*/}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-semibold leading-snug">
            Account Settings
          </h1>
        </div>
        {/* Right/Bottom Content */}
        <div className="flex flex-col w-full md:w-1/2 items-center justify-center">
          {/* Right panel */}
          <section className="flex flex-col w-3/4 items-center justify-center p-6">
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug w-full text-left my-4">
              Profile Info
            </h1>
            <hr className="w-full border-t-1 border-gray-400" />

            {/*Profile image*/}
            <div className="flex flex-col w-full md:flex-row items-center justify-between mt-6 mb-2">
              <div className="w-24 h-24 rounded-full bg-white">
                <img
                  src={userIcon}
                  alt="Profile Picture"
                  className="w-full h-full rounded-full object-cover p-0.5"
                />
              </div>
              <div className="flex flex-col gap-2 text-center">
                <div className="flex gap-4">
                  <Button onClick={() => console.log("Change Photo clicked")}>
                    Change Photo
                  </Button>

                  <Button onClick={() => console.log("Remove Photo clicked")}>
                    Remove Photo
                  </Button>
                </div>
                <div className="text-sm font-light">
                  <small className="text-sm text-gray-400 font-light">
                    We support PNGs, JPGs, and GIFs under 2MB.
                  </small>
                </div>
              </div>
            </div>

            {/*Name and Number*/}
            <div className="flex flex-col w-full my-4 gap-4">
              <FloatingInputField
                label="First Name"
                type="text"
                value=""
                action={() => console.log("First Name changed")}
                isValid={true}
              />
              <FloatingInputField
                label="Last Name"
                type="text"
                value=""
                action={() => console.log("Last Name changed")}
                isValid={true}
              />
              <FloatingInputField
                label="Phone Number"
                type="text"
                value=""
                action={() => console.log("Phone Number changed")}
                isValid={true}
              />
            </div>
          </section>

          <section className="flex flex-col w-3/4 items-center justify-center p-6 mb-10">
            <div className="flex w-full flex-col">
              <h1 className="text-2xl md:text-3xl font-semibold leading-snug w-full text-left my-4">
                Account Security
              </h1>
              <hr className="w-full border-t-1 border-gray-400" />
            </div>
            {/*Gmail Integration*/}
            <div className="flex flex-col w-full mt-4 mb-2">
              <h3 className="text-lg text-left font-medium text-gray-300 mt-4">
                Gmail Integration
              </h3>
              <p className="text-sm text-left text-gray-400 mb-4">
                Connect your Gmail account to allow email parsing and analysis.
              </p>
              <div className="flex flex-col md:flex-row w-full my-6 gap-4">
                <div className="flex w-1/2">
                  <Button onClick={handleGmailButtonClick}>
                    {gmailButtonText}
                  </Button>
                </div>
                <div className="flex w-1/2 text-left items-center justify-leading">
                  {error && (
                    <p className="text-sm text-red-400" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Reset */}
              <div className="flex flex-col md:flex-row items-center justify-center items-center  w-full">
                <div className="flex w-1/2">
                  <Button
                    onClick={() => console.log("Change Password clicked")}
                  >
                    Change Password
                  </Button>
                </div>
                <div className="flex w-1/2 items-center">
                  <FloatingInputField
                    label="Reset Password"
                    type="password"
                    value=""
                    action={() => console.log("User is entering new password.")}
                    isValid={true}
                  />
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="flex flex-row items-center justify-between w-full">
              <div className="">
                <h3 className="text-lg text-left font-medium text-gray-300 mt-4">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="text-sm text-left text-gray-400 mb-4">
                  Enable 2FA to add an extra layer of security to your account.
                </p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={() => console.log("2FA toggled")}
                  />
                  <div
                    className="w-11 h-6 bg-gray-600 
                    rounded-full peer peer-focus:ring-blue-300 peer-checked:bg-blue-600 
                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 
                    after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                  ></div>
                </label>
              </div>
            </div>

            {/* Delete Account */}
            <div className="flex w-full flex-col md:flex-row items-center justify-between">
              <div className="flex w-1/2">
                <Button
                  onClick={handleDelete}
                  // disabled={busy}
                  aria-busy={busy}
                  // className="red"
                >
                  {busy ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
              <div className="flex w-1/2 text-left">
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
