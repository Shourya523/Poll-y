"use client";

import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebaseConfig";
import { useAuth } from "./AuthProvider";
import { LogOut, LogIn } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navigation } from "./Sidebar";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Feed";
  const match = navigation.find(
    (n) => n.href !== "/" && pathname.startsWith(n.href)
  );
  return match ? match.name : "Poll-y";
}

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const title = getPageTitle(pathname || "/");

  const handleSignIn = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { console.error(e); }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); }
    catch (e) { console.error(e); }
  };

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center px-6 md:px-8 border-b border-white/5 bg-[#070709]/80 backdrop-blur-md">
      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{title}</h2>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-8 w-24 rounded-full bg-white/5 animate-pulse" />
        ) : !user ? (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <LogIn size={14} />
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-white/10"
              />
            )}
            <span className="hidden sm:block text-sm font-medium text-slate-300">
              {user.displayName?.split(" ")[0]}
            </span>
            <button
              onClick={handleSignOut}
              className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-full text-sm font-medium transition-all border border-red-500/20 active:scale-95"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
