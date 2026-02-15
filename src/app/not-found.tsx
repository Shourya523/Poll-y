import Link from "next/link";
import TopBar from "../components/TopBar";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#0a0a0a] font-sans text-slate-200">
      <TopBar />
      
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full"></div>
          <HelpCircle size={64} className="relative text-indigo-500" />
        </div>

        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">404</h1>
        
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-slate-100">
            Lost in the digital void?
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been deleted, 
            moved, or perhaps it never existed at all.
          </p>
        </div>

        <Link 
          href="/"
          className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold transition-all hover:bg-slate-200 active:scale-95"
        >
          <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Safety
        </Link>
      </main>

      <footer className="py-8 text-slate-800 text-xs font-mono">
        ERR_PAGE_NOT_FOUND
      </footer>
    </div>
  );
}