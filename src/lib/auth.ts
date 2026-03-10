import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createServiceClient } from "./supabase";

// Re-export the DefaultSession type so the module augmentation can reference it
declare module "next-auth" {
  interface Session {
    user: {
      googleSub?: string;
    } & DefaultSession["user"];
  }
}

// Dev-only credentials provider — bypasses Google OAuth in development
const devProvider = Credentials({
  name: "Dev Login",
  credentials: {
    email: { label: "Email", type: "text" },
  },
  async authorize(credentials) {
    if (process.env.NODE_ENV !== "development") return null;
    const email = (credentials?.email as string) || "dev@dreamboard.test";
    return {
      id: "dev-user-1",
      email,
      name: "Dev User",
      image: null,
    };
  },
});

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  ...(process.env.NODE_ENV === "development" ? [devProvider] : []),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile, trigger }) {
      // On sign-in, store the Google 'sub' in the JWT token
      if (trigger === "signIn" && profile?.sub) {
        token.googleSub = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose googleSub to the client session
      if (token.googleSub) {
        session.user.googleSub = token.googleSub as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      // Upsert the user profile in Supabase on every sign-in.
      // Fire-and-forget: if Supabase is down, sign-in still works.
      try {
        const supabase = createServiceClient();

        const googleSub = (profile as Record<string, unknown>)?.sub as
          | string
          | undefined;
        if (!googleSub) {
          console.warn("No Google sub in profile, skipping profile upsert");
          return;
        }

        const { error } = await supabase.from("profiles").upsert(
          {
            google_sub: googleSub,
            email:
              (profile as Record<string, unknown>)?.email ??
              user.email ??
              null,
            first_name:
              (profile as Record<string, unknown>)?.given_name ?? null,
            last_name:
              (profile as Record<string, unknown>)?.family_name ?? null,
            avatar_url:
              (profile as Record<string, unknown>)?.picture ??
              user.image ??
              null,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "google_sub",
          }
        );

        if (error) {
          console.error("Failed to upsert profile:", error.message);
        }
      } catch (err) {
        // Never block sign-in due to a profile upsert failure
        console.error("Profile upsert threw:", err);
      }
    },
  },
});
