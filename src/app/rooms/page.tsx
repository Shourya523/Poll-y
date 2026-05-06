"use client";

import Link from "next/link";
import { ROOMS } from "../../components/MakePoll";
import { LayoutGrid, ArrowRight } from "lucide-react";

const ROOM_GRADIENTS: Record<string, string> = {
  general: "from-slate-600/30 to-slate-800/10",
  tech:    "from-cyan-600/25 to-blue-900/10",
  gaming:  "from-purple-600/25 to-violet-900/10",
  sports:  "from-green-600/25 to-emerald-900/10",
  music:   "from-pink-600/25 to-rose-900/10",
  movies:  "from-orange-600/25 to-amber-900/10",
  food:    "from-red-600/25 to-rose-900/10",
  science: "from-indigo-600/25 to-blue-900/10",
};

const ROOM_BORDERS: Record<string, string> = {
  general: "hover:border-slate-500/40",
  tech:    "hover:border-cyan-500/40",
  gaming:  "hover:border-purple-500/40",
  sports:  "hover:border-green-500/40",
  music:   "hover:border-pink-500/40",
  movies:  "hover:border-orange-500/40",
  food:    "hover:border-red-500/40",
  science: "hover:border-indigo-500/40",
};

export default function RoomsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <LayoutGrid size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rooms</h1>
            <p className="text-slate-500 text-sm">Browse polls by topic</p>
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {ROOMS.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className={`group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-6 transition-all overflow-hidden ${ROOM_BORDERS[room.id]}`}
          >
            {/* Gradient fill */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ROOM_GRADIENTS[room.id]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`} />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{room.emoji}</div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                    {room.label}
                  </h2>
                  <p className="text-sm text-slate-500">#{room.id} polls</p>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
