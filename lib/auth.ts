import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs"; // Requires: npm install bcryptjs @types/bcryptjs

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET ? [TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    })] : []),
    // For testing/development or email/password fallback
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            // Custom fields aren't returned by authorize by default types,
            // but the session callback fetches fresh data anyway.
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Fetch fresh user data to get plan/usage status
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            id: true, 
            plan: true, 
            trialEndsAt: true, 
            aiUsageCountToday: true 
          }
        });

        if (user) {
          session.user.id = user.id;
          (session.user as any).plan = user.plan;
          (session.user as any).trialEndsAt = user.trialEndsAt;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  events: {
    // AUTOMATIC TRIAL START
    createUser: async ({ user }) => {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // +48 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: "TRIAL",
          trialEndsAt: trialEnd,
          aiUsageCountToday: 0
        }
      });
      console.log(`[Auth] New user ${user.id} enrolled in 48h TRIAL.`);
    }
  }
};
