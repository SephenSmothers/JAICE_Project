import { useState } from "react";
import { FloatingInputField } from "./FloatingInputField";
import Button from "@/client/global-components/button";
import { useNavigate } from "react-router";

export function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmit(true);
    console.log("Form submitted with:", { email, password });
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
          label="Password"
          type="password"
          value={password}
          action={setPassword}
        />
        <Button type="submit">
          Log In
        </Button>
      </form>
    </div>
  );
}
