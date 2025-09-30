import { useState } from "react";
import { FloatingInputField } from "./FloatingInputField";
import Button from "@/client/global-components/button";
import { useNavigate } from "react-router";

export function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmit(true);
    console.log("Form submitted with:", { email, password });
    console.log("Emails match:", email === confirmEmail);
    console.log("Passwords match:", password === confirmPassword);
    navigate("/home");
  };

  return (
    <div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FloatingInputField
          label="Email"
          type="email"
          value={email}
          action={setEmail}
        />
        <FloatingInputField
          label="Confirm Email"
          type="email"
          value={confirmEmail}
          action={setConfirmEmail}
        />
        <FloatingInputField
          label="Password"
          type="password"
          value={password}
          action={setPassword}
        />
        <FloatingInputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          action={setConfirmPassword}
        />
        <Button type="submit">
          Sign Up
        </Button>
      </form>
    </div>
  );
}
