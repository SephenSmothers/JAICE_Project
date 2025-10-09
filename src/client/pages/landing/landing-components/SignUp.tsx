import { useState } from "react";
import { FloatingInputField } from "@/client/global-components/FloatingInputField";
import Button from "@/client/global-components/button";
import { useNavigate } from "react-router";
import {
  validateEmail,
  validatePassword,
} from "@/client/global-services/input-validation";
import { CreateNewAccount, LogUserIn } from "../landing.api";

export function SignUp() {
  const navigate = useNavigate();

  // The overcomplicated state management here is to allow for real-time validation feedback.
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validEmail, setValidEmail] = useState<boolean | null>(null);
  const [validConfirmEmail, setValidConfirmEmail] = useState<boolean | null>(
    null
  );
  const [validPassword, setValidPassword] = useState<boolean | null>(null);
  const [validConfirmPassword, setValidConfirmPassword] = useState<
    boolean | null
  >(null);

  // The following function handles form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    event.preventDefault();

    // Validate all fields
    const isValid =
      validEmail && validConfirmEmail && validPassword && validConfirmPassword;

    // If any field is invalid, set the corresponding validation states to false to trigger error messages
    if (!isValid) {
      console.log("Input is invalid, please correct the errors.");

      if (!validEmail) {
        setValidEmail(false);
        console.log("Email is not valid");
      }

      if (!validPassword) {
        setValidPassword(false);
        console.log("Password is not valid");
      }

      if (!validConfirmEmail) {
        setValidConfirmEmail(false);
        console.log("Emails do not match");
      }

      if (!validConfirmPassword) {
        setValidConfirmPassword(false);
        console.log("Passwords do not match");
      }
      return;
    }

    // If all fields are valid, proceed with form submission
    console.log("Input Valid, proceeding with submission");

    // call the front end api to create the account
    const [accountCreated, accountMessage] = await CreateNewAccount({
      email,
      password,
    });

    // If account creation fails, log the error message
    // If it succeeds, log in the user
    if (!accountCreated) {
      console.log("Account creation failed:", accountMessage);
      return;
    } else {
      console.log(
        "Account created successfully proceeding to login:",
        accountMessage
      );

      await LogUserIn({ navigate, email, password });
    }
  };

  // The following functions handle real-time input and validation
  const handleEmailInput = (value: string) => {
    setEmail(value);
    setValidEmail(validateEmail(value) && value !== "");
  };

  const handleConfirmEmailInput = (value: string) => {
    setConfirmEmail(value);
    setValidConfirmEmail(value === email && value !== "");
  };

  const handlePasswordInput = (value: string) => {
    setPassword(value);
    setValidPassword(validatePassword(value) && value !== "");
  };

  const handleConfirmPasswordInput = (value: string) => {
    setConfirmPassword(value);
    setValidConfirmPassword(value === password && value !== "");
  };

  return (
    <div>
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <FloatingInputField
          label="Email"
          type="email"
          value={email}
          isValid={validEmail}
          action={handleEmailInput}
          errorTitle="Invalid Email"
          errorMessage="Please enter a valid email address."
        />
        <FloatingInputField
          label="Confirm Email"
          type="email"
          value={confirmEmail}
          isValid={validConfirmEmail}
          action={handleConfirmEmailInput}
          errorTitle="Email Mismatch"
          errorMessage="Emails do not match."
        />

        <FloatingInputField
          label="Password"
          type="password"
          value={password}
          isValid={validPassword}
          action={handlePasswordInput}
          errorTitle="Minimumm Requirements Not Met"
          errorMessage="8 Characters, 1 Number, 1 Special"
        />
        <FloatingInputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          isValid={validConfirmPassword}
          action={handleConfirmPasswordInput}
          errorTitle="Password Mismatch"
          errorMessage="Passwords do not match."
        />
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
}
