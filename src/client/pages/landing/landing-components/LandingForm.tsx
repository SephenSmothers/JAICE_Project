import { LogIn } from "./LogIn";
import { SignUp } from "./SignUp";
import { useState } from "react";
import { SlidingToggle } from "@/client/global-components/SlidingToggle";
import { QuickSignIn } from "./QuickSignIn";

export function LandingForm() {
  const [newUser, setNewUser] = useState(false);

  const formStyle = {
    border: "2px solid var(--color-blue-3)",
    borderRadius: "1rem",
    padding: "2rem",
    background: "rgba(var(--color-blue-5-rgb), 0.1)",
    boxShadow: "0 0px 10px rgba(var(--color-blue-3-rgb), 0.4)"
  }

  return (
    <div className="flex flex-col justify-between gap-4 w-full" style={formStyle}>
      <SlidingToggle
        leftLabel="Log In"
        rightLabel="Sign Up"
        action={setNewUser}
        initialValue={true}
      />
      {newUser ? <SignUp /> : <LogIn />}
      <div className="flex border-b my-8 border-1/2 border-white/20 text-center justify-center">
        <h3 className="relative top-1/2 transform translate-y-1/2 backdrop-blur-md text-[var(--color-blue-5)] px-4">OR</h3>
      </div>
      <QuickSignIn />
    </div>
  );
}
