"use client"
import { useState } from "react";
import TopBar from "../components/TopBar";
import MakePoll from "../components/MakePoll";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router=useRouter()
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#0a0a0a] font-sans text-slate-200 selection:bg-indigo-500/30">
      <TopBar />
      
      <main className="flex w-full max-w-2xl flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="w-full space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Settling the debate?
            </h1>
            <p className="text-slate-400 text-lg">
              Create a quick poll and get answers in seconds.
            </p>
          </header>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-[#121212] border border-white/5 rounded-2xl p-1">
              <MakePoll />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10"
              onClick={() => {router.push("/user-history")}}
            >
              <Clock size={16} />
              Looking for your previous polls?
            </button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-slate-600 text-xs">
        {new Date().getFullYear()} Poll-y &bull; Internship task for applyo.
      </footer>
    </div>
  );
}