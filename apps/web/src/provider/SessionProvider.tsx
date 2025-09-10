"use client"

import { Session } from "next-auth";
import { useEffect } from "react";
import { useUserSessionStore } from "../store/useUserSessionStore";

interface SessionProviderProps {
    session: Session | null;
}

export default function SessionProvider({ session }: SessionProviderProps) {
    const { setSession } = useUserSessionStore();

    useEffect(() => {
        setSession(session);
    }, [session, setSession]);

    return null;
}