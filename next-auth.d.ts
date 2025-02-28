import type { DefaultJWT } from "next-auth/jwt";

import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string;
  }
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
  }
}
