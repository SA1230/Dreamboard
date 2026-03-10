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
        className="flex items-center gap-3 text-stone-600 hover:bg-stone-100 transition-colors rounded-xl"
      >
        <LogIn size={18} className="text-stone-400" />
        <span className="text-sm font-medium">Sign in</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut()}
      className="flex items-center gap-3 text-stone-600 hover:bg-stone-100 transition-colors rounded-xl"
    >
      <LogOut size={18} className="text-stone-400" />
      <span className="text-sm font-medium">Sign out</span>
    </button>
  );
}
