import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const users: Record<
          string,
          {
            password: string;
            name: string;
            role: "admin" | "analyst";
            avatar: string;
          }
        > = {
          "admin@fraudsense.ai": {
            password: "demo2024",
            name: "Admin User",
            role: "admin",
            avatar: "",
          },
          "analyst@fraudsense.ai": {
            password: "demo2024",
            name: "Fraud Analyst",
            role: "analyst",
            avatar: "",
          },
        };
        const u = users[credentials.email.toLowerCase()];
        if (!u || u.password !== credentials.password) return null;
        return {
          id: credentials.email,
          email: credentials.email,
          name: u.name,
          role: u.role,
          avatar: u.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.avatar = (user as { avatar?: string }).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "analyst" | undefined;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
