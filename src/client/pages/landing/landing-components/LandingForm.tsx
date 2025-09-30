import { LogIn } from "./LogIn";
import { SignUp } from "./SignUp";
import { useState } from "react";
import { SlidingToggle } from "@/client/global-components/SlidingToggle";
export function LandingForm() {
  const [newUser, setNewUser] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <SlidingToggle
        leftLabel="Log In"
        rightLabel="Sign Up"
        action={setNewUser}
        initialValue={true}
      />
      {newUser ? <SignUp /> : <LogIn />}
    </div>
  );
}
