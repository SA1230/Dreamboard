"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-stone-200 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors"
      >
        <LogIn size={14} />
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {session.user?.image && (
        <img
          src={session.user.image}
          alt=""
          className="h-7 w-7 rounded-full border border-stone-200"
          referrerPolicy="no-referrer"
        />
      )}
      <button
        onClick={() => signOut()}
        className="p-1 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
