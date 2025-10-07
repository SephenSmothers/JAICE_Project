import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { observeUser } from "../global-services/auth";
import type { User } from "firebase/auth";

type AuthCtx = { user: User | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, loading: true });
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return observeUser((u) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

