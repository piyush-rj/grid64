import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        provider?: string | null;
        token?: string | null;
    }

    interface Session {
        user?: User;
        expires: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        user?: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            provider?: string | null;
            token?: string | null;
        };
    }
}
