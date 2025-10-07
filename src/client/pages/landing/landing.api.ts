/*
* Create New Account Function
* Simulates an API call to create a new user account, we need to hook this into our backend.
*/
export async function CreateNewAccount({email, password}: {email: string, password: string}) {
  // takes the email and password, and creates a new account.
  console.log("Simulating API Call to create new account");
  //simulate a network delay.




  // THIS IS WHERE WE HOOK INTO THE BACKEND. IT SHOULD RETURN A BOOLEAN (SUCCESS OR FAILURE) AND A MESSAGE (ERROR OR SUCCESS MESSAGE).
  await new Promise((resolve) => setTimeout(resolve, 1500)); //1.5 second delay
  console.log("Creating new account with email:", email);
  console.log("Creating new account with password:", password);
  const isCreated = true;
  const message = isCreated ? "Account created successfully" : "Account creation failed";
  return [isCreated, message];
}

/* Authenticate User Function
* Simulates an API call to authenticate a user with our auth service.
*/
export async function AuthenticateUser(
  email: string,
  password: string
): Promise<[boolean, string]> {
  // takes the email and password, and returns a tuple of isAuthenticated and message.
  console.log("Simulating API Call");
  
  
  
  // THIS IS WHERE WE HOOK INTO THE BACKEND. IT SHOULD RETURN A BOOLEAN (SUCCESS OR FAILURE) AND A MESSAGE (ERROR OR SUCCESS MESSAGE).
  await new Promise((resolve) => setTimeout(resolve, 1500)); //1.5 second delay
  console.log("Authenticating user with email:", email);
  console.log("Authenticating user with password:", password);

  // Simulated response
  const isAuthenticated = true;
  const message = isAuthenticated
    ? "Authentication successful"
    : "Authentication failed";
  return [isAuthenticated, message];
}


/* 
* Log User In Function
* Uses the AuthenticateUser function to log the user in and navigate to the home page if successful.
* Regardless of creating a new account or loggin in, we always hit the auth service to verify credentials prior to logging in.
* 
* New Account -> Success -> Log In -> Authorized -> Navigate to /home
* Existing User             Log In -> Authorized -> Navigate to /home
* 
* Log In -> Not Authorized -> Show Error (handled in LogIn component)
* New Account -> Failure -> Show Error (handled in SignUp component)
* The backend auth service should relay the error message to this function for display to the user. (or we can map errors to a toast message and display that instead)
*/
export async function LogUserIn({
  navigate,
  email,
  password,
}: {
  navigate: (path: string) => void;
  email: string;
  password: string;
}) {
  console.log("Email and Password are valid, proceeding to log in.");

  const auth = await AuthenticateUser(email, password);
  console.log("Authentication results:", auth[0], auth[1]);

  if (!auth[0]) {
    // If authentication failed
    console.log("Authentication failed:", auth[1]);
    return;
  } else {
    // If authentication succeeded
    console.log("Authentication succeeded:", auth[1], "navigating to home.");
    navigate("/home");
    return;
  }
}

// Simulated Third-Party Log In Function
// This function simulates logging in with a third-party provider like Google or Outlook.
export async function thirdPartyLogIn(provider: string) {
  console.log(`Simulating ${provider} log in...`);

  // THIS IS WHERE WE HOOK INTO THE BACKEND. IT SHOULD RETURN A BOOLEAN (SUCCESS OR FAILURE) AND A MESSAGE (ERROR OR SUCCESS MESSAGE).
  await new Promise((resolve) => setTimeout(resolve, 1500)); //1.5 second delay

  const isSuccess = true; // Simulate success
  const message = isSuccess ? `${provider} log in successful` : `${provider} log in failed`; 
  console.log(message);
  return [isSuccess, message];
}