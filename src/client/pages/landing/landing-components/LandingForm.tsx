import { LogIn } from "./LogIn";
import { SignUp } from "./SignUp";
import { useState } from "react";

export function LandingForm() {
  const [newUser, setNewUser] = useState(false);

  const toggleStyle: React.CSSProperties = {
    appearance: "none",
    width: "100%",
    height: "40px",
    background: "rgba(0, 0, 0, 0)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    lineHeight: "40px",
    zIndex: 1,
  };

  const selectedStyle: React.CSSProperties = {
    fontWeight: "bold",
    background: "black",
    width: "50%",
    height: "38px",
    borderRadius: "8px",
    left: newUser ? "0%" : "50%",
    animation: "slide 0.3s ease-in-out",
    transition: "left 0.3s ease-in-out",
    position: "absolute",
    zIndex: -1,
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex relative items-center justify-center">
        <div style={selectedStyle} />
        <label className="absolute w-1/2 self-center left-0">Sign Up</label>
        <label className="absolute w-1/2 self-center right-0">Log In</label>
        <input
          type="checkbox"
          checked={newUser}
          onChange={() => setNewUser(!newUser)}
          style={toggleStyle}
        />
      </div>
      {newUser ? <SignUp /> : <LogIn />}
    </div>
  );
}
