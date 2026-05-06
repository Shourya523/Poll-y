"use client"
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { Flame, Clock, Users, Trophy, Plus, TrendingUp, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ROOMS } from "../components/MakePoll";
import MakePoll from "../components/MakePoll";

interface PollOption { id: string; text: string; votes: number; }
interface Poll { id: string; question: string; options: PollOption[]; createdAt: any; room?: string; }

function FeedPollCard({ poll, onClick }: { poll: Poll; onClick: () => void }) {
  const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0);
  const winner = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
  const room = ROOMS.find(r => r.id === poll.room) || ROOMS[0];
  const date = poll.createdAt?.toDate
    ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true })
    : "Just now";

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-[#13131a] transition-all cursor-pointer overflow-hidden"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
            {room.emoji} {room.label}
          </span>
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <Clock size={11} /> {date}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug">
          {poll.question}
        </h3>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={12} />
            <span>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
          </div>
          {totalVotes > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500/80 font-medium">
              <Trophy size={12} />
              <span className="truncate max-w-[140px]">{winner.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentPolls = async () => {
      try {
        const q = query(collection(db, "polls"), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPolls();
  }, []);

  const totalVotes = polls.reduce((acc, p) => acc + p.options.reduce((a, o) => a + o.votes, 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent border border-white/5 p-8">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap size={11} className="fill-indigo-300" /> Live Feed
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Settling debates,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">one vote at a time.</span>
          </h1>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Jump in and vote on the latest polls, or start one of your own.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp size={14} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Active Polls</p>
                <p className="text-white font-semibold">{polls.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users size={14} className="text-purple-400" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Total Votes</p>
                <p className="text-white font-semibold">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Flame size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Rooms</p>
                <p className="text-white font-semibold">{ROOMS.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create poll CTA for signed-in users */}
      {user && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick Create</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <MakePoll />
        </div>
      )}

      {/* Recent Polls Feed */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Recent Polls</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : polls.length > 0 ? (
          <div className="space-y-3">
            {polls.map(poll => (
              <FeedPollCard
                key={poll.id}
                poll={poll}
                onClick={() => router.push(`/poll/${poll.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Plus size={24} className="text-indigo-400" />
            </div>
            <p className="text-slate-300 font-semibold mb-1">No polls yet</p>
            <p className="text-slate-600 text-sm">Be the first to start a debate!</p>
          </div>
        )}
      </div>
    </div>
  );
}