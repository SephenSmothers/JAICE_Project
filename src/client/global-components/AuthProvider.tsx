import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { observeUser } from "../global-services/auth";
import type { User } from "firebase/auth";

// Define the shape of the authentication context
type AuthCtx = { user: User | null; loading: boolean };

// Create a global context for authentication
const Ctx = createContext<AuthCtx>({ user: null, loading: true });

// Custom hook to access the authentication context
export const useAuth = () => useContext(Ctx);

// AuthProvider component to manage and provide authentication state
export default function AuthProvider({ children }: { children: ReactNode }) {
    // Store user and loading state (or null if not logged in)
    const [user, setUser] = useState<User | null>(null);
    // Track loading state while checking authentication status
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to authentication state changes
        // The observer will call the callback with the current user or null
        return observeUser((u) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    // Provide the user and loading state to child components
    return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

