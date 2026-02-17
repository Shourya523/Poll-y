"use client";

import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebaseConfig";
import { useAuth } from "./AuthProvider";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { user, loading } = useAuth();
  const router=useRouter()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center z-[100] border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="w-full mx-auto flex items-center justify-between px-6 md:px-20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight text-white" onClick={()=>router.push("/")}>Poll-y</h1>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Log In With Google"}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm font-medium text-slate-400">
                {user.displayName || "Explorer"}
              </span>
              <button
                onClick={handleSignOut}
                className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all border border-red-500/20 active:scale-95"
              >
                <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}